require('dotenv').config();
const sendbird = require('sendbird');
const os = require('os');
const fs = require('fs');
const axios = require('axios');
const FormData = require("form-data");
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const version = "version 0.1a";
const { exec } = require("child_process");
const {
	CookieJar
} = require("tough-cookie");
const got = require("got");
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

// Launch
let credentials = {
	userid: process.env.REDDIT_ID,
	username: process.env.REDDIT_USER,
	passwd: process.env.REDDIT_PASS,
};
let sb = new sendbird({
	appId: "2515BDA8-9D3A-47CF-9325-330BC37ADA13"
});
const form = new FormData();
form.append("user", credentials.username);
form.append("passwd", credentials.passwd);
form.append("api_type", "json");

console.log("Connecting to sendbird...");
got.post({
	body: form,
	url: "https://ssl.reddit.com/api/login",
}).then(res => {
	const cookieJar = new CookieJar();
	cookieJar.setCookieSync("reddit_session=" + encodeURIComponent(JSON.parse(res.body).json.data.cookie), "https://s.reddit.com");
	got({
		cookieJar,
		method: "get",
		url: "https://s.reddit.com/api/v1/sendbird/me",
	}).then(sbRes => {
		const sbInfo = JSON.parse(sbRes.body);
		sb.connect(credentials.userid, sbInfo.sb_access_token).then(userInfo => {
			console.log("Successfully connected to sendbird with u/" + userInfo.nickname + "!");
		}).catch(err => {
			console.error("Error while trying to connect to sendbird. Error: " + err);
		});
	}).catch(err => {
		console.error("Error while trying to get access token. Error: " + err);
	});
}).catch(err => {
	console.error("Error while trying to get session token. Error: " + err);
});


let modlist = JSON.parse(fs.readFileSync("data/moderators.json"));

let ch = new sb.ChannelHandler();

ch.onMessageReceived = async function(channel, message) {
	let messageText = message.message.replace(/[^\r\n\t\x20-\x7E\xA0-\xFF]/g, " ").trim();
	
	if (messageText.startsWith("$")) {
		let cleanMessageText = messageText.toLowerCase().slice(1).trim();
		let args = messageText.split(" ").slice(1);
		let command = cleanMessageText.split(" ")[0];
		switch (command) {	
			case "id":
				if (!isUndefined(args[0])) {
					if (args[0].toLowerCase().startsWith("@")) {
						args[0] = args[0].slice(1);
					} else if (args[0].toLowerCase().startsWith("u/")) {
						args[0] = args[0].slice(2);
					}
					var userToGet = args[0];
					axios.get(`https://www.reddit.com/user/${userToGet}/about.json`).then((result) => {
						sendMsgWithChannel(channel, isUndefined(result.data.error) ? `${userToGet}'s ID is: \n${result.data.data.id.split("?")[0]}` : `This isn't a real person!`);
					});
				} else {
					sendMsgWithChannel(channel, `Your ID is: ${message._sender.userId}`);
				}
				break;
			case "cat":
				if ("thedefault1".includes(message._sender.nickname.toLowerCase())) {
					catPath = `${stringFromList(args)}`
					catPathFormatted = catPath.replace(/\s/g, '');
					catPathCleaned = catPathFormatted.replace('..','safe');
					readFileAsync(`${catPathCleaned}`, {encoding: 'utf8'})
					.then(contents => {
					const obj = JSON.parse(contents);
					objFormatted = JSON.stringify(obj);
					sendMsgWithChannel(channel, `${objFormatted}`)
					})
						.catch(error => {
						throw error
					})
				}
				else {
					sendMsgWithChannel(channel, "You do not have access to this command.");
				}
				break;
			case "restart":
				if (modlist.includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "Restarting...\n \nProcess ID: " + process.pid);
					console.log("This is pid " + process.pid);
					setTimeout(function () {
    					process.on("exit", function () {
        					require("child_process").spawn(process.argv.shift(), process.argv, {
           					cwd: process.cwd(),
            				detached : true,
							stdio: "inherit"
							
						});
						process.exit(1)
   					});
    			process.exit();
				}, 5000);
				}
				else {
					sendMsgWithChannel(channel, "You do not have access to this command.");
				}
				break;
			case "shutdown":
				if (modlist.includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "Shutting down...");
					setTimeout(() => {  process.exit(1) }, 1500);
					break;
				}
				else {
					sendMsgWithChannel(channel, "You do not have access to this command.");
				}
					break;
			case "uptime":
				var uptime = Math.floor(process.uptime());
				if ((uptime > 60 && uptime < 120)) {
					var uptimeStr = "minute";
					var uptimeFloored = Math.truncate(uptime / 60);
				}
				if ((uptime > 120 && uptime < 3600)) {
					var uptimeStr = "minutes";
					var uptimeFloored = Math.truncate(uptime / 60);
				}
				else if(uptime > 3600) {
					var uptimeStr = "hours(s)";
					var uptimeFloored = Math.truncate(uptime / 3600);
				}
				else {
					var uptimeStr = "seconds";
					var uptimeFloored = Math.round(uptime);
				}
				sendMsgWithChannel(channel, `I've been running for ${uptimeFloored} ${uptimeStr} so far.`);
				break;
			case "botinfo":
				var uptime = Math.floor(process.uptime());
				sendMsgWithChannel(channel, "A bridge between the chat and TrogloBot." + os.EOL + os.EOL +  version + `. Currently running on an ${os.arch} based device with ${os.type}. `);
				break;
			case "launch":
				if (modlist.includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "Launching TrogloBot...");
					exec(`node main.js`, (error, stdout, stderr) => {
						if (error) {
							console.log(`error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.log(`stderr: ${stderr}`);
							return;
						}
						console.log(`stdout: ${stdout}`);
				});
			}
			break;
		}
	}
}

function stringFromList(list) {
	let returning = "";
	for (let i = 0; i < list.length; i++) {
		returning += list[i] + " ";
	}
	return returning;
}

function isUndefined(thing) {
	return typeof(thing) == "undefined";
}

function sendMsgWithChannel(channel, msg) {
	channel.sendUserMessage(msg.replace("@all", "@ all").replace("u/all", "u / all"), (message, error) => {
		if (error) {
			if (error.code != 900060) {
				console.warn(`An error occured while trying to send "${msg}" in the channel ${channel.name}`);
				console.warn(error);
			}
		}
	});
}

sb.addChannelHandler("vsdfh64mc93mg0cn367vne4m50bn3b238", ch);
let messageInterval = setInterval(function() {
}, 1000 * 60 * 60 * 24);


