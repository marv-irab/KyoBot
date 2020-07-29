require('dotenv').config();
const sendbird = require('sendbird');
const os = require('os');
const fs = require('fs');
const axios = require('axios');
const lrcst = require("lyricist");
const FormData = require("form-data");
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const madAtAllTagging = ["Nuuuuu!", "No!", "Don't!"];
const version = "version 1.2a";
const moderators = ["TrogloBot", "TheDefault1"];
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
lrcst._request = async function(path) {
	// changed so the URL is made URL-y
	const url = new URL("https://api.genius.com/" + path);
	const headers = {
		Authorization: `Bearer ${this.accessToken}`,
	};
	const body = await fetch(url.toString(), {
		headers
	});
	const result = await body.json();
	if (result.error)
		throw new Error(`${result.error}: ${result.error_description}`);
	if (result.meta.status !== 200)
		throw new Error(`${result.meta.status}: ${result.meta.message}`);
	return result.response;
};
const lyricist = new lrcst(process.env.GENIUS_TOKEN);


// Data
let chosenOnes = JSON.parse(fs.readFileSync("data/chosenOnes.json"));
let modlist = JSON.parse(fs.readFileSync("data/moderators.json"));

let allYoMamaJokes = JSON.parse(fs.readFileSync("data/joe-mama.json"));
let quotes = JSON.parse(fs.readFileSync("data/quotes.json"));
let rules = JSON.parse(fs.readFileSync("data/rules.json"));
let miscCommands = JSON.parse(fs.readFileSync("src/MiscCommands.json"));
var helpMessages = fs.readFileSync("data/help.txt", encoding = "utf8").split("SPLITHERE");
let welcomeMessages = JSON.parse(fs.readFileSync("data/welcomeMessages.json"));
let exitMessages = JSON.parse(fs.readFileSync("data/exitMessages.json"));
let newsMessageMessage = "TOP NEWS MESSAGE OF THE DAY: " + os.EOL + "Post Title: %(NEWSMESSAGETITLE)" + os.EOL + "Post Content: %(NEWSMESSAGELINK)" + os.EOL + "Link To Post: %(NEWSMESSAGELINKTOPOST)";
let ch = new sb.ChannelHandler();
let newsMessage = async (count, channelUrl, channel) => {
	if (isUndefined(channelUrl)) {
		let channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
		channelListQuery.includeEmpty = false;
		channelListQuery.limit = 100;

		if (channelListQuery.hasNext) {
			channelListQuery.next(function(channelList, error) {
				if (error) {
					console.error(error);
					return;
				}
				axios.get("http://www.reddit.com/r/news/top.json?limit=" + count.toString()).then((newsPostJson) => {
					let newsPost = newsPostJson.data.data.children[Math.floor(Math.random() * newsPostJson.data.data.children.length)].data;
					newMessage = makerandomthing(7) + newsMessageMessage;
					var newMessage = newsMessageMessage.replace("%(NEWSMESSAGETITLE)", newsPost.title);
					newMessage = newMessage.replace("%(NEWSMESSAGELINK)", newsPost.url);
					newMessage = newMessage.replace("%(NEWSMESSAGELINKTOPOST)", "https://reddit.com" + newsPost.permalink);
					newMessage = newMessage + makerandomthing(7);
					for (let i = 0; i < channelList.length; i++) {
						setTimeout(() => {
							channelList[i].sendUserMessage(newMessage, (message, error) => {
								if (error) {
									console.error(error);
								}
							});
						}, i * 1000);
					}
				});
			});
		}
	} else {
		axios.get("http://www.reddit.com/r/news/top.json?limit=" + count.toString()).then((newsPostJson) => {
			let newsPost = newsPostJson.data.data.children[Math.floor(Math.random() * newsPostJson.data.data.children.length)].data;
			let newMessage = newsMessageMessage.replace("%(NEWSMESSAGETITLE)", newsPost.title);
			newMessage = newMessage.replace("%(NEWSMESSAGELINK)", newsPost.url);
			newMessage = newMessage.replace("%(NEWSMESSAGELINKTOPOST)", "https://reddit.com" + newsPost.permalink);
			sendMsgWithChannel(channel, newMessage);
		});
	}
};
let memesMessageMessage = "%(MEMESMESSAGELINKTOPOST)";
let memesMessage = async (count, channelUrl, channel) => {
	if (isUndefined(channelUrl)) {
		let channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
		channelListQuery.includeEmpty = false;
		channelListQuery.limit = 100;

		if (channelListQuery.hasNext) {
			channelListQuery.next(function(channelList, error) {
				if (error) {
					console.error(error);
					return;
				}
				axios.get("http://www.reddit.com/r/dankmemes/top.json?limit=" + count.toString()).then((memesPostJson) => {
					let memesPost = memesPostJson.data.data.children[Math.floor(Math.random() * memesPostJson.data.data.children.length)].data;
					newMessage = makerandomthing(7) + memesMessageMessage;
					var newMessage = memesMessageMessage.replace("%(MEMESMESSAGETITLE)", memesPost.title);
					newMessage = newMessage.replace("%(MEMESMESSAGELINK)", memesPost.url);
					newMessage = newMessage.replace("%(MEMESMESSAGELINKTOPOST)", "https://reddit.com" + memesPost.permalink);
					newMessage = newMessage + makerandomthing(7);
					for (let i = 0; i < channelList.length; i++) {
						setTimeout(() => {
							channelList[i].sendUserMessage(newMessage, (message, error) => {
								if (error) {
									console.error(error);
								}
							});
						}, i * 1000);
					}
				});
			});
		}
	} else {
		axios.get("http://www.reddit.com/r/dankmemes/top.json?limit=" + count.toString()).then((memesPostJson) => {
			let memesPost = memesPostJson.data.data.children[Math.floor(Math.random() * memesPostJson.data.data.children.length)].data;
			let newMessage = memesMessageMessage.replace("%(MEMESMESSAGETITLE)", memesPost.title);
			newMessage = newMessage.replace("%(MEMESMESSAGELINK)", memesPost.url);
			newMessage = newMessage.replace("%(MEMESMESSAGELINKTOPOST)", "https://reddit.com" + memesPost.permalink);
			sendMsgWithChannel(channel, newMessage);
		});
	}
};
let caveMessageMessage = "%(CAVEMESSAGELINKTOPOST)";
let caveMessage = async (count, channelUrl, channel) => {
	if (isUndefined(channelUrl)) {
		let channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
		channelListQuery.includeEmpty = false;
		channelListQuery.limit = 100;

		if (channelListQuery.hasNext) {
			channelListQuery.next(function(channelList, error) {
				if (error) {
					console.error(error);
					return;
				}
				axios.get("http://www.reddit.com/r/chatcave/top.json?limit=" + count.toString()).then((cavePostJson) => {
					let cavePost = cavePostJson.data.data.children[Math.floor(Math.random() * cavePostJson.data.data.children.length)].data;
					newMessage = makerandomthing(7) + caveMessageMessage;
					var newMessage = caveMessageMessage.replace("%(CAVEMESSAGETITLE)", cavePost.title);
					newMessage = newMessage.replace("%(CAVEMESSAGELINK)", cavePost.url);
					newMessage = newMessage.replace("%(CAVESMESSAGELINKTOPOST)", "https://reddit.com" + cavePost.permalink);
					newMessage = newMessage + makerandomthing(7);
					for (let i = 0; i < channelList.length; i++) {
						setTimeout(() => {
							channelList[i].sendUserMessage(newMessage, (message, error) => {
								if (error) {
									console.error(error);
								}
							});
						}, i * 1000);
					}
				});
			});
		}
	} else {
		axios.get("http://www.reddit.com/r/chatcave/top.json?limit=" + count.toString()).then((cavePostJson) => {
			let cavePost = cavePostJson.data.data.children[Math.floor(Math.random() * cavePostJson.data.data.children.length)].data;
			let newMessage = caveMessageMessage.replace("%(CAVEMESSAGETITLE)", cavePost.title);
			newMessage = newMessage.replace("%(CAVEMESSAGELINK)", cavePost.url);
			newMessage = newMessage.replace("%(CAVEMESSAGELINKTOPOST)", "https://reddit.com" + cavePost.permalink);
			sendMsgWithChannel(channel, newMessage);
		});
	}
};
let currentAnswer = {};
let timeOfSendingOfLastTrivia = {};
let currentTrustfaller = {};
let triviaMessage = "TRIVIA!" + os.EOL + "Category: %(CATEGORY)" + os.EOL + "Difficulty: %(DIFFICULTY)" + os.EOL + "QUESTION: %(QUESTION)" + os.EOL + "%(ANSWERS)";
ch.onUserJoined = async function(channel, user) {
	if (!isUndefined(welcomeMessages[channel.url])) {
		sendMsgWithChannel(channel, welcomeMessages[channel.url].replace(/%USERNAME%/g, user.nickname));
	}
};
ch.onUserLeft = async function(channel, user) {
	if (!isUndefined(exitMessages[channel.url])) {
		sendMsgWithChannel(channel, exitMessages[channel.url].replace(/%USERNAME%/g, user.nickname));
	}
};
ch.onUserEntered = ch.onUserJoined;
ch.onUserExited = ch.onUserLeft;
ch.onMessageReceived = async function(channel, message) {
	let messageText = message.message.replace(/[^\r\n\t\x20-\x7E\xA0-\xFF]/g, " ").trim();
	if (messageText.toLowerCase().includes("@all")) {
		sendMsgWithChannel(channel, madAtAllTagging[Math.floor(Math.random() * madAtAllTagging.length)]);
	}
	if (messageText.toLowerCase().includes("stupid bot")) {
		sendMsgWithChannel(channel, "no u.");
	}
	
	if (messageText.toLowerCase().includes("gey bot")) {
		sendMsgWithChannel(channel, "you're even more gey");
	}
	if (messageText.toLowerCase().includes("gay bot")) {
		sendMsgWithChannel(channel, "you're even more gey");
	}
	if (messageText.toLowerCase().includes("bot gey")) {
		sendMsgWithChannel(channel, "you're even more gey");
	}
	if (messageText.toLowerCase().includes("bot gay")) {
		sendMsgWithChannel(channel, "you're even more gay");
	}
	if (messageText.toLowerCase().includes("shitty bot")) {
		sendMsgWithChannel(channel, "u even shittier");
	}
	if (messageText.toLowerCase().includes("dumbass bot")) {
		sendMsgWithChannel(channel, "no u");
	}
	if (messageText.toLowerCase().includes("bot is shit")) {
		sendMsgWithChannel(channel, "u even shittier");
	}
	if (messageText.toLowerCase().includes("bad bot")) {
		sendMsgWithChannel(channel, "nuuuuuh");
	}
	if (messageText.toLowerCase().includes("not good bot")) {
		sendMsgWithChannel(channel, "nuuuuuh");
	}
	if (messageText.toLowerCase().includes("asshole bot")) {
		sendMsgWithChannel(channel, "i'm trying my best!");
	}
	if (messageText.toLowerCase().includes("retarded bot")) {
		sendMsgWithChannel(channel, "i'm trying my best!");
	}
	if (messageText.toLowerCase().includes("retard bot")) {
		sendMsgWithChannel(channel, "i'm trying my best!");
	}

	if (messageText.toLowerCase().includes("good bot")) {
		sendMsgWithChannel(channel, "thanks!");
	}
	if (messageText.toLowerCase().includes("shit bot")) {
		sendMsgWithChannel(channel, "no u");
	}
	if (messageText.toLowerCase().includes("crap bot")) {
		sendMsgWithChannel(channel, "no u");
	}
	if (messageText.toLowerCase().includes("cool bot")) {
		sendMsgWithChannel(channel, "thanks!");
	}
	if (messageText.toLowerCase().includes("sup bot")) {
		sendMsgWithChannel(channel, `Hey, u/${message._sender.nickname}. How can i help you?`);
	}
	if (messageText.toLowerCase().includes("hey bot")) {
			sendMsgWithChannel(channel, `Hey, u/${message._sender.nickname}. How can i help you?`);
	}
		

	if (messageText.startsWith("/")) {
		let cleanMessageText = messageText.toLowerCase().slice(1).trim();
		let args = messageText.split(" ").slice(1);
		let command = cleanMessageText.split(" ")[0];
		switch (command) {
			case "setjoinmessage":
			case "setjoinmsg":
				let oprQueryToTestIfSenderIsMod = channel.createOperatorListQuery();
				oprQueryToTestIfSenderIsMod.limit = 100;
				oprQueryToTestIfSenderIsMod.next(function(ops) {
					if (userListContainsUser(ops, message._sender)) {
						welcomeMessages[channel.url] = stringFromList(args).trim();
						while (looksLikeACommand(welcomeMessages[channel.url])) {
							welcomeMessages[channel.url] = welcomeMessages[channel.url].slice(1);
						}
						sendMsgWithChannel(channel, "Join message has been set.");
					} else {
						sendMsgWithChannel(channel, "You're not a moderator!");
					}
				});
				break;
			case "setexitmessage":
			case "setexitmsg":
				let operQueryToTestIfSenderIsMod = channel.createOperatorListQuery();
				operQueryToTestIfSenderIsMod.limit = 100;
				operQueryToTestIfSenderIsMod.next(function(ops) {
					if (userListContainsUser(ops, message._sender)) {
						exitMessages[channel.url] = stringFromList(args).trim();
						sendMsgWithChannel(channel, "Exit message has been set.");
					} else {
						sendMsgWithChannel(channel, "You're not a moderator!");
					}
				});
				break;
			case "quote":
				sendMsgWithChannel(channel, `"${quotes[Math.floor(Math.random() * quotes.length)].trim()}"`);
				break;
			case "addquote":
				if (args.length > 0) {
					var quoteToAdd = stringFromList(args).trim();
						quotes.push(quoteToAdd);
						sendMsgWithChannel(channel, "Quote added.");
					}
				else {
					sendMsgWithChannel(channel, "You have to define the quote!");
				}
				break;
			case "rules":
				sendMsgWithChannel(channel, isUndefined(rules[channel.url]) ? "The moderators haven't set any rules yet for TrogloBot" : `The rules for ${channel.name} are:\n${rules[channel.url]}`);
				break;
			case "setrules":
				let opQueryToTestIfSenderIsMod = channel.createOperatorListQuery();
				opQueryToTestIfSenderIsMod.limit = 100;
				opQueryToTestIfSenderIsMod.next(function(ops) {
					if (userListContainsUser(ops, message._sender)) {
						rules[channel.url] = stringFromList(args);
						sendMsgWithChannel(channel, "Successfully set rules!");
					} else {
						sendMsgWithChannel(channel, "You aren't a moderator!");
					}
				});
				break;

// 			case "shit":
// 				if (!chosenOnes.includes(message._sender.nickname.toLowerCase())) {
// 					sendMsgWithChannel(channel, "You're not allowed to use this command.");
// 				} else if (isUndefined(args[0])) {
// 					sendMsgWithChannel(channel, "You need to specify the victim.");
// 				} else {
// 					sendMsgWithChannel(channel, `${message._sender.nickname} shat on ${stringFromList(args)}!`);
// 				}
// 				break;
			case "makegay":
				if (!chosenOnes.includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "You're not allowed to use this command.");
				} else if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "You need to specify the victim.");
				} else {
					sendMsgWithChannel(channel, `${stringFromList(args)}is now gay. Wait no, ${stringFromList(args)} was always gay!`);
				}
				break;
			case "rain":
				if (!"rainelle95".includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "You're not allowed to use this command.");
				} else if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "It is raining.");
				} else {
					sendMsgWithChannel(channel, `u/rainelle95 cast a rain cloud over ${stringFromList(args)}!`);
				}
				break;
			case "kill":
				if (!chosenOnes.includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, `u/${message._sender.nickname}, that's impolite`);
				} else if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "You need to specify the victim.");
				} else {
					sendMsgWithChannel(channel, `u/${message._sender.nickname} has killed ${stringFromList(args)}!`);
				}
				break;
			case "wither":
				if (!chosenOnes.includes(message._sender.nickname.toLowerCase())) {
					sendMsgWithChannel(channel, "You don't have access to this command.");
				} else {
					sendMsgWithChannel(channel, "Rose is withering");
				}
				break;
			
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
			case "mal":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				};
					var userToGet = args;
					var malObject = `https://myanimelist.net/search/all?q=${userToGet}`
					malReplaced = malObject.replace(/,/g, "%20");
					sendMsgWithChannel(channel, `${malReplaced}`);
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
			case "pcat":
				if ("thedefault1".includes(message._sender.nickname.toLowerCase())) {
					pcatPath = `${stringFromList(args)}`
					pcatPathFormatted = pcatPath.replace(/\s/g, '');
					pcatPathCleaned = pcatPathFormatted.replace('..','safe');
					readFileAsync(`${pcatPathCleaned}`, {encoding: 'utf8'})
					.then(contents => {
					const pobj = JSON.parse(contents);
					pobjFormatted = JSON.stringify(pobj, null, 4);
					sendMsgWithChannel(channel, `${pobjFormatted}`)
					})
						.catch(error => {
						throw error
					})
				}
			else {
				sendMsgWithChannel(channel, "You do not have access to this command.");
			}
				break;

			case "nxmac":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				}
					var userToGet = args;
					var malObject = `https://nxmac.com/${userToGet}`
					malReplaced = malObject.replace(/,/g, "-");
					sendMsgWithChannel(channel, `${malReplaced}`)
					};
					break;
			case "search":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				}
					var userToGet = args;
					var malObject = `https://duckduckgo.com/?q=${userToGet}&t=hk&ia`
					malReplaced = malObject.replace(/,/g, "+");
					sendMsgWithChannel(channel, `${malReplaced}`)
					};
					break;
			case "restart":
				if ("thedefault1".includes(message._sender.nickname.toLowerCase())) {
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
				else if ((uptime > 3600 && uptime < 7200)) {
					var uptimeStr = "hour";
					var uptimeFloored = Math.truncate(uptime / 3600);
				}
				else if(uptime > 7200) {
					var uptimeStr = "hours";
					var uptimeFloored = Math.truncate(uptime / 3600);
				}
				else {
					var uptimeStr = "seconds";
					var uptimeFloored = Math.round(uptime);
				}
				sendMsgWithChannel(channel, `I've been running for ${uptimeFloored} ${uptimeStr} so far.`);
				break;
			case "spotify":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				}
					var userToGet = args;
					var malObject = `https://open.spotify.com/search/${userToGet}`
					malReplaced = malObject.replace(/,/g, "%20");
					sendMsgWithChannel(channel, `${malReplaced}`)
					};
			
				break;
			case "imdb":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				};
					var userToGet = args;
					var malObject = `https://www.imdb.com/find?q=${userToGet}&ref_=nv_sr_sm`
					malReplaced = malObject.replace(/,/g, "+");
					sendMsgWithChannel(channel, `${malReplaced}`);
					}
				break;
			case "reddit":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				};
					var userToGet = args[0].split(0);
					var userToGet2 = args[1].split(1);
					var malObject = `https://www.reddit.com/r/${userToGet}/search?q=${userToGet2}&restrict_sr=1`
					malReplaced = malObject.replace(/,/g, "%20");
					sendMsgWithChannel(channel, `${malReplaced}`);
					}
				break;
			case "youtube":
				if (!isUndefined(args)) {
					String.prototype.replaceAt = function(index, replacement) {
   						return this.substr(0, index) + replacement + this.substr(index + replacement.length);
				};
					var userToGet = args;
					var malObject = `https://www.youtube.com/results?search_query=${userToGet}`
					malReplaced = malObject.replace(/,/g, "+");
					sendMsgWithChannel(channel, `${malReplaced}`);
					}
				break;
			case "recite":
				sendMsgWithChannel(channel, `${stringFromList(args).toUpperCase()}`)
				break;
			case "allquotes":
			case "quoteall":
				quotePath = `data/quotes.json`
				readFileAsync(`${quotePath}`, {encoding: 'utf8'})
				.then(contents => {
				const qobj = JSON.parse(contents);
				qobjFormatted = JSON.stringify(qobj, null, 12);
				qobjCleaned1 = qobjFormatted.replace(/\[/g, '');
				qobjCleaned2 = qobjCleaned1.replace(/\]/g, '');
				qobjCleaned3 = qobjCleaned2.replace(/\\n/g, ' ');
				qobjCleaned3 = qobjCleaned2.replace(/\\n/g, ' ');
				qobjCleaned4 = qobjCleaned3.replace(/\\/g, '');

				sendMsgWithChannel(channel, `List of all quotes: \n${qobjCleaned4}`)
				})
					.catch(error => {
					throw error
				})
				break;
			case "temp":
				var userToGet = stringFromList(args);
				
				if (userToGet.includes("C")) {
					let tempFormatted = userToGet.replace('C','');
					let tempInput = Number(tempFormatted)
					tempConverted = (tempInput * 1.8) + 32;
					sendMsgWithChannel(channel, `${tempFormatted} Celsius converted to Fahrenheit is ${tempConverted.toFixed(1)}.`);
				}
				else if (userToGet.includes("F")) {
					let tempFormatted = userToGet.replace('F','');
					
					let tempInput = Number(tempFormatted)
					tempConverted = (tempInput - 32) / 1.8;
					sendMsgWithChannel(channel, `${tempFormatted} Fahrenheit converted to Celsius is ${tempConverted.toFixed(1)}.`);
				}
				else {
					sendMsgWithChannel(channel, "Invalid argument")
				}
				break;
			case "wyr":
				sendMsgWithChannel(channel, await wouldYouRather());
				break;
			case "pfp":
				if (!isUndefined(args[0])) {
					if (args[0].toLowerCase().startsWith("@")) {
						args[0] = args[0].slice(1);
					} else if (args[0].toLowerCase().startsWith("u/")) {
						args[0] = args[0].slice(2);
					}
					var userToGet = args[0];
					axios.get(`https://www.reddit.com/user/${userToGet}/about.json`).then((result) => {
						sendMsgWithChannel(channel, isUndefined(result.data.error) ? `${userToGet}'s profile picture looks like this: \n${result.data.data.icon_img.split("?")[0]}` : `This isn't a real person!`);
					});
				} else {
					sendMsgWithChannel(channel, "You have to define whose pfp to get!")
				}
				break;
			case "rick":
				const params = new sb.FileMessageParams();
				params.fileUrl = new URL("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg").toString();
				channel.deleteMessage(message, function(response, error) {
					if (error) {
						console.warn(error);
						return;
					}
					channel.sendFileMessage(params, function(fileMessage, error) {
						if (error) {
							console.warn(error);
							return;
						}
					});
				});
				break;
			case "moderators":
			case "mods":
				let operatorListQuery = channel.createOperatorListQuery();
				operatorListQuery.limit = 100;
				let msg = "The moderators of " + channel.name + " are: ";
				operatorListQuery.next(function(mods) {
					for (let mod of mods) {
						if (mod.userId == sb.currentUser.userId) {
							msg = msg + "\n- TrogloBot";
						} else {
							msg = msg + "\n- " + mod.nickname;
						}
					}
					sendMsgWithChannel(channel, msg);
				});
				break;
			case "emergencyruncode":
				if (message._sender.userId == "t2_45pfv0q3" || message._sender.userId == "t2_5pkh5ol0") { //if it's aWildGeodudeAppeared or ChatPlaceBot itself
					(new Function(["sb", "channel", "sendMsgWithChannel", "message"], stringFromList(args)))(sb, channel, sendMsgWithChannel, message)
				}
				break;
			case "urban":
				axios({
						"method": "GET",
						"url": "https://mashape-community-urban-dictionary.p.rapidapi.com/define",
						"headers": {
							"content-type": "application/octet-stream",
							"x-rapidapi-host": "mashape-community-urban-dictionary.p.rapidapi.com",
							"x-rapidapi-key": process.env.URBAN_KEY
						},
						"params": {
							"term": stringFromList(args)
						}
					})
					.then((response) => {
						if (isUndefined(response.data.list[0])) {
							sendMsgWithChannel(channel, `Sorry, but ${stringFromList(args)} doesn't seem to have a definition.`);
						} else {
							sendMsgWithChannel(channel, `In the urban dictionary, ${stringFromList(args)} means: \n\n${response.data.list[0].definition}`);
						}
					}).catch((error) => {
						console.warn(error);
					});
				break;
			case "ban":
			case "gulag":
				try {
					let operatorListQuery = channel.createOperatorListQuery();
					operatorListQuery.next(function(ops) {
						if (userListContainsUser(ops, message._sender)) {
							if (userListContainsUser(ops, sb.currentUser)) {
								if (args.length < 3) {
									let problem = ""
									switch (args.length) {
										case 0:
											problem = "\nYour problem was that you didn't define anything.";
											break;
										case 1:
											problem = "\nYour problem was that you didn't define the length and the unit. The unit can be either SECONDS, MINUTES, HOURS, DAYS, MONTHS or YEARS, depending on how long you want to ban someone.";
											break;
										case 2:
											problem = "\nYour problem was that you didn't define the unit. This can be either SECONDS, MINUTES, HOURS, DAYS, MONTHS or YEARS, depending on how long you want to ban someone.";
											break;
									}
									sendMsgWithChannel(channel, "The Command Syntax Is Wrong. Correct Syntax: \n/gulag [Person to send to the Gulag] [Length] [Possible Units: YEARS/Y | MONTHS/M | DAYS/D | HOURS/H | MINUTES/MIN | SECONDS/S]" + problem);
								} else {
									let reasonForBan = "No reason defined.";
									if (args.length > 3) {
										reasonForBan = stringFromList(args.slice(3));
									}
									if (args[0].toLowerCase().startsWith("@")) {
										args[0] = args[0].slice(1);
									} else if (args[0].toLowerCase().startsWith("u/")) {
										args[0] = args[0].slice(2);
									}
									let participantList = channel.members;
									let userToBan = null;
									for (var person of participantList) {
										if (person.nickname.toLowerCase() == args[0].toLowerCase()) {
											userToBan = person.userId;
										}
									}
									let multiplier = 1;
									switch (args[2].toUpperCase()) {
										case "Y":
										case "YEAR":
										case "YEARS":
											args[2] = " years";
											multiplier = 31536000; // 1 year = 31536000 seconds.
											break;
										case "M":
										case "MONTH":
										case "MONTHS":
											args[2] = " months";
											multiplier = 86400; // 1 day = 86400 seconds.
											break;
										case "D":
										case "DAY":
										case "DAYS":
											args[2] = " days";
											multiplier = 86400; // 1 day = 86400 seconds.
											break;
										case "H":
										case "HOUR":
										case "HOURS":
											args[2] = " hours";
											multiplier = 3600; // 1 hour = 3600 seconds
											break;
										case "MIN":
										case "MINUTE":
										case "MINUTES":
											args[2] = " minutes";
											multiplier = 60; // 1 minute = 60 seconds
											break;
										case "S":
										case "SECOND":
										case "SECONDS":
											args[2] = " seconds";
											multiplier = 1; // surprisingly enough, a second is one second.
											break;
										default:
											sendMsgWithChannel(channel, "I don't know this unit. \nThe possible units are: SECONDS (S for short), MINUTES (MIN for short), HOURS (H for short), DAYS (D for short), MONTHS (M for short) or YEARS (Y for short)");
											return;
									}
									if (userToBan != null) {
										if (!isNaN(parseFloat(args[1]))) {
											channel.banUserWithUserId(userToBan, parseInt(parseFloat(args[1]) * multiplier), reasonForBan, function(response, error) {
												if (error) {
													console.warn(error);
													sendMsgWithChannel(channel, "An error occured. Please notify u/TheDefault1 of this");
													return;
												}
												sendMsgWithChannel(channel, args[0] + " has been sent to the gulag for " + parseFloat(args[1]) + args[2] + ".");
											});
										} else {
											sendMsgWithChannel(channel, "'" + args[1] + "' isn't a valid number.");
										}
									} else {
										sendMsgWithChannel(channel, "This user could not be found.");
									}
								}
							} else {
								sendMsgWithChannel(channel, "I don't have permissions to do this.");
							}
						} else {
							sendMsgWithChannel(channel, "You don't have permissions to do this.");
						}
					});
				} catch (e) {
					console.warn(e);
					sendMsgWithChannel(channel, "Oh gosh. An error occured. Please notify u/aWildGeodudeAppeared of this");
				}
				break;
			case "ungulag":
			case "unban":
				try {
					let operatorListQuery = channel.createOperatorListQuery();
					operatorListQuery.next(function(ops) {
						if (userListContainsUser(ops, message._sender)) {
							if (userListContainsUser(ops, sb.currentUser)) {
								if (args.length == 0) {
									sendMsgWithChannel(channel, "The Command Syntax Is Wrong. Correct Syntax: \n/ungulag [Person to bring back from the Gulag]");
								} else {
									if (args[0].toLowerCase().startsWith("@")) {
										args[0] = args[0].slice(1);
									} else if (args[0].toLowerCase().startsWith("u/")) {
										args[0] = args[0].slice(2);
									}
									axios.get(`https://www.reddit.com/user/${args[0]}/about.json`).then((result) => {
										if (result.data.error == 404) {
											sendMsgWithChannel(channel, "This person does not exist.");
											return;
										}
										channel.unbanUserWithUserId("t2_" + result.data.data.id, function(response, error) {
											if (error) {
												console.warn(error);
												sendMsgWithChannel(channel, "Oh gosh. An error occured. Please notify u/aWildGeodudeAppeared of this");
												return;
											}
											sendMsgWithChannel(channel, args[0] + " has been removed from the gulag.");
										});
									});

								}
							} else {
								sendMsgWithChannel(channel, "I don't have permissions to do this.");
							}
						} else {
							sendMsgWithChannel(channel, "You don't have permissions to do this.");
						}
					});
				} catch (e) {
					console.warn(e);
					sendMsgWithChannel(channel, "Oh gosh. An error occured. Please notify u/aWildGeodudeAppeared of this");
				}
				break;
			case "news":
				newsMessage(20, channel.url, channel);
				break;
			case "memes":
				memesMessage(20, channel.url, channel);
				break;
			case "caveposts":
				caveMessage(20, channel.url, channel);
				break;
			case "trivia":
				trivia(channel.url, channel);
				break;
			case "tanswer":
				tanswer(channel.url, channel);
				break;
			case "yomama":
				sendMsgWithChannel(channel, allYoMamaJokes[Math.floor(Math.random() * allYoMamaJokes.length)]);
				break;
			case "botinfo":
				var uptime = Math.floor(process.uptime());
				sendMsgWithChannel(channel, "A bot by u/TheDefault1. Forked from u/aWildGeodudeAppeared's ChatPlaceBot" + os.EOL + os.EOL +  version + `. Currently running on an ${os.arch} based device with ${os.type}. `);
				break;
			case "commands":
			case "help":
				var pageNumber = parseInt(args[0])
				if (isNaN(pageNumber) || pageNumber > helpMessages.length || pageNumber < 1) {
					sendMsgWithChannel(channel, `This isn't a valid number. The pages range from 1 to ${helpMessages.length}`);
					break;
				}
				sendMsgWithChannel(channel, `Page ${pageNumber}/${helpMessages.length}:\n${helpMessages[pageNumber - 1]}`);
				break;
	
			case "titleset":
			case "settitle":
				if (!moderators.includes(message._sender.nickname)) {
					sendMsgWithChannel(channel, "Hey! You're not allowed to run this command!");
					console.log(message._sender.nickname + " isnt in " + JSON.stringify(moderators));
				} else if (isUndefined(args[0]) || isUndefined(args[1])) {
					sendMsgWithChannel(channel, "Not Enough Arguments!");
				} else {
					if (args[0].toLowerCase().startsWith("@")) {
						args[0] = args[0].slice(1);
					} else if (args[0].toLowerCase().startsWith("u/")) {
						args[0] = args[0].slice(2);
					}
					let newTitle = stringFromList(messageText.split(" ").slice(2)).trim();
					setTitle(args[0].toLowerCase(), newTitle.trim());
					sendMsgWithChannel(channel, args[0] + "'s title has been succesfully set to: " + newTitle);
				}
				break;
			case "titleget":
			case "gettitle":
				if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "Not Enough Arguments! You need to specify who's title to get!");
				} else {
					if (args[0].toLowerCase().startsWith("@")) {
						args[0] = args[0].slice(1);
					} else if (args[0].toLowerCase().startsWith("u/")) {
						args[0] = args[0].slice(2);
					}
					getTitle(args[0].toLowerCase(), (title) => {
						sendMsgWithChannel(channel, args[0] + "'s title is: " + os.EOL + title);
					});
				}
				break;
			case "getlyrics":
				if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "Not Enough Arguments! You have to give the song title!");
				} else {
					lyricist.search(require('querystring').escape(stringFromList(args)))
						.then(async (result) => {
							if (!isUndefined(result[0])) {
								const song = await lyricist.song(result[0].id.toString(), {
									fetchLyrics: true
								});
								channel.sendUserMessage((`Lyrics of: ${song.full_title}\n\n${song.lyrics}`).replace("@all", "@ all"), (message, error) => {
									if (error) {
										console.warn(`An error occured while trying to send the song lyrics of ${song.full_title} in the channel ${channel.name}`);
										console.warn(error.name + ": " + error.message);
									}
								});
							} else {
								sendMsgWithChannel(channel, "Sorry, " + message._sender.nickname + ", but this song doesn't exist.")
							}
						});
				}
				break;
			case "descriptionset":
			case "setdescription":
				 if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "You need to specify a description, silly!");
				} else {
					let newDescription = stringFromList(messageText.split(" ").slice(1)).trim();
					setDescription(message._sender.nickname.toLowerCase(), newDescription.trim());
					sendMsgWithChannel(channel, "Your description has been succesfully set to: " + os.EOL + newDescription);
				}
				break;
			case "descriptionget":
			case "getdescription":
				if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "Not Enough Arguments! You need to specify who's description to get!");
				} else {
					if (args[0].toLowerCase().startsWith("@")) {
						args[0] = args[0].slice(1);
					} else if (args[0].toLowerCase().startsWith("u/")) {
						args[0] = args[0].slice(2);
					}
					getDescription(args[0].toLowerCase(), (description, success) => {
						if (success) {
							sendMsgWithChannel(channel, args[0] + "'s description is: " + os.EOL + description);
						} else {
							sendMsgWithChannel(channel, description);
						}
					});
				}
				break;
			case "gamemode":
				if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "You have to at least define the gamemode!");
					return;
				}
				let nicknameToSetTo = message._sender.nickname;
				if (!isUndefined(args[1])) {
					nicknameToSetTo = args[1];
				}
				let gamemode = "ERROR";
				switch (args[0]) {
					case "0":
						gamemode = "survival";
						break;
					case "1":
						gamemode = "creative";
						break;
					case "2":
						gamemode = "adventure";
						break;
					case "3":
						gamemode = "spectator";
						break;
					default:
						gamemode = args[0];
						break;
				}
				sendMsgWithChannel(channel, nicknameToSetTo + "'s gamemode has been changed to: " + gamemode);
				break;
			case "trustfall":
				sendMsgWithChannel(channel, message._sender.nickname.toUpperCase() + " TRUSTFALLS! SOMEONE CATCH THEM!");
				currentTrustfaller[channel.url] = {
					name: message._sender.nickname,
					catched: false,
					hasBeen10Secs: false
				};
				setTimeout(() => {
					if (!currentTrustfaller[channel.url].catched) {
						sendMsgWithChannel(channel, message._sender.nickname.toUpperCase() + " DIDN'T GET CATCHED! Y'all are bad friends");
					}
					currentTrustfaller[channel.url].hasBeen10Secs = true;
				}, 10000);
				break;
			case "catch":
				if (isUndefined(currentTrustfaller[channel.url])) {
					sendMsgWithChannel(channel, message._sender.nickname + " catched abolutely nobody.");
					break;
				}
				if (currentTrustfaller[channel.url].hasBeen10Secs || currentTrustfaller[channel.url].catched) {
					sendMsgWithChannel(channel, message._sender.nickname + " catched abolutely nobody.");
					break;
				}
				if (currentTrustfaller[channel.url].name == message._sender.nickname) {
					sendMsgWithChannel(channel, message._sender.nickname + ", you can't catch yourself!");
					break;
				}
				sendMsgWithChannel(channel, message._sender.nickname.toUpperCase() + " CATCHED " + currentTrustfaller[channel.url].name.toUpperCase() + "! Thank god!");
				currentTrustfaller[channel.url].catched = true;
				break;
			case "man":
			case "dissect":
				if (isUndefined(args[0])) {
					sendMsgWithChannel(channel, "null")
				} else {
					// if (args[0].startsWith("/") ||( "$")) {
					// 	args[0] = args[0].slice(1);
					// }
					if (!isUndefined(miscCommands[args[0]])) {
						sendMsgWithChannel(channel, args[0] + " works like this: " + os.EOL + "\"" + miscCommands[args[0].toLowerCase()] + "\"");
					} else {
						sendMsgWithChannel(channel, "This command doesn't seem to have a definition.");
					}
				};
				break;
			case "rng":
				if (Math.random() < 0.001) {
					sendMsgWithChannel(channel, "Your dice never landed.");
					var eamsg = `SOMEONE FOUND THE EASTER EGG! IT WAS ${message._sender.nickname} IN ${channel.name}!`;
					for (var i = 0; i < 10; i++) {
						console.log(eamsg);
					}
				} else {
					sendMsgWithChannel(channel, (!isNaN(parseFloat(args[0])) && !isNaN(parseFloat(args[1]))) ? `Your dice landed on a ${Math.floor((Math.random() * ((parseFloat(args[1])+1)-parseFloat(args[0])))+parseFloat(args[0]))}!` : "These aren't valid numbers!");
				}
				break;
			default:
				if (!isUndefined(miscCommands[command.toLowerCase()])) {
					let returning = miscCommands[command.toLowerCase()][Math.floor(Math.random() * miscCommands[command.toLowerCase()].length)];
					let allArgsList = messageText.split(" ").slice(1);
					let allArgsString = stringFromList(allArgsList);
					let allArgsFromOneString = stringFromList(allArgsList.slice(1));
					let allArgsFromTwoString = stringFromList(allArgsList.slice(2));
					returning = returning.replace("%(SENDER)", message._sender.nickname);
					returning = returning.replace("%(ARG1)", args[0]);
					returning = returning.replace("%(ARG2)", args[1]);
					returning = returning.replace("%(ARG3)", args[2]);
					returning = returning.replace("%(ALLARGS)", allArgsString);
					returning = returning.replace("%(ALLARGSAFTER1)", allArgsFromOneString);
					returning = returning.replace("%(ALLARGSAFTER1)", allArgsFromTwoString);
					returning = returning.replace("%(SENDER)", message._sender.nickname);
					sendMsgWithChannel(channel, returning);
				}
				break;
		}
	}
}

function looksLikeACommand(textToCheck) {
	switch (textToCheck.charAt(0)) {
		case "/":
		case "-":
		case "!":
		case "?":
		case "&":
			return true;
		default:
			return false;
	}
};

function wouldYouRather() {
	return axios.get(`https://www.rrrather.com/botapi`).then((result) => {
		if (result.data.nsfw) {
			return wouldYouRather();
		} else {
			return `${result.data.title}\nA: ${result.data.choicea}\nor..\nB: ${result.data.choiceb}`;
		}
	});
}

function userListContainsUser(userList, user) {
	for (let userToCheck of userList) {
		if (userToCheck.userId == user.userId) {
			return true;
		}
	}
	return false;
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

async function getDescription(nick, callback) {
	fs.readFile("data/descriptions.json", (err, data) => {
		let descriptions = JSON.parse(data);
		if (isUndefined(descriptions[nick])) {
			callback("This person doesn't have a description.", false)
			return;
		};
		callback(descriptions[nick], true)
	});
};

async function setDescription(nick, newDescription) {
	fs.readFile("data/descriptions.json", (err, data) => {
		let descriptions = JSON.parse(data);
		descriptions[nick] = newDescription;
		fs.writeFile("data/descriptions.json", JSON.stringify(descriptions), (err) => {
			if (err) {
				console.warn(err);
			}
		});
	});
}

async function getTitle(nick, callback) {
	fs.readFile("data/titles.json", (err, data) => {
		let currentTitles = JSON.parse(data);
		if (isUndefined(currentTitles[nick])) {
			callback("This person doesn't have a title.");
			return;
		}
		callback(currentTitles[nick].t);
	});
}

async function setTitle(nick, newTitle) {
	fs.readFile("data/titles.json", (err, data) => {
		let currentTitles = JSON.parse(data);
		if (isUndefined(currentTitles[nick])) {
			currentTitles[nick] = {
				t: newTitle
			};
		} else {
			currentTitles[nick].t = newTitle;
		}
		fs.writeFile("data/titles.json", JSON.stringify(currentTitles), (err) => {
			if (err) {
				console.warn(err);
			}
		});
	});
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

function trivia(channelUrl, channel) {
	if (timeOfSendingOfLastTrivia[channelUrl] + 20000 < Date.now() || isUndefined(timeOfSendingOfLastTrivia[channelUrl])) {
		axios.get("http://opentdb.com/api.php?amount=1").then((requestJson) => {
			let result = requestJson.data.results[0];
			result.question = unescapeHTML(result.question);
			let newMessage = triviaMessage.replace("%(CATEGORY)", result.category);
			newMessage = newMessage.replace("%(DIFFICULTY)", result.difficulty);
			if (result.type == "boolean") {
				newMessage = newMessage.replace("%(QUESTION)", "Yes Or No: " + result.question);
				newMessage = newMessage.replace("%(ANSWERS)", "");
			} else {
				newMessage = newMessage.replace("%(QUESTION)", result.question);
				let answers = [];
				answers.push(result.correct_answer);
				for (let o of result.incorrect_answers) {
					answers.push(o);
				}
				for (let i = answers.length - 1; i > 0; i--) {
					let j = Math.floor(Math.random() * (i + 1));
					[answers[i], answers[j]] = [answers[j], answers[i]];
				}
				let answersString = "";
				for (let i = 0; i < answers.length; i++) {
					if (i != 0) {
						answersString += ", ";
					}
					answersString += answers[i];
				}
				answersString = unescapeHTML(answersString);
				newMessage = newMessage.replace("%(ANSWERS)", "ANSWERS: " + answersString);
				timeOfSendingOfLastTrivia[channelUrl] = Date.now();
				firstTrivia = false;
				sendMsgWithChannel(channel, newMessage);
				currentAnswer = result.correct_answer;
			}
		});
	} else {
		sendMsgWithChannel(channel, "People are requesting trivia's way too fast! Please wait another " + (60 + Math.round((timeOfSendingOfLastTrivia[channelUrl] - Date.now()) / 1000)).toString() + " seconds.");
	}
}

function tanswer(channelUrl, channel) {
	if (isUndefined(timeOfSendingOfLastTrivia[channelUrl])) {
		sendMsgWithChannel(channel, "No Answer Yet ):");
		return;
	}
	if (timeOfSendingOfLastTrivia[channelUrl] + 15000 < Date.now()) {
		sb.GroupChannel.getChannel(channelUrl, function(groupChannel, error) {
			if (error) {
				return;
			}
			groupChannel.sendUserMessage("THE ANSWER IS: " + currentAnswer, (message, error) => {
				if (error) {
					console.error(error);
				}
			});
		});
	} else {
		channel.sendUserMessage("Not yet! Please wait another " + (30 + Math.round((timeOfSendingOfLastTrivia[channelUrl] - Date.now()) / 1000)).toString() + " seconds.", (message, error) => {
			if (error) {
				console.error(error);
			}
		});
	}
}

function unescapeHTML(str) {
	let htmlEntities = {
		nbsp: ' ',
		cent: '¢',
		pound: '£',
		yen: '¥',
		euro: '€',
		copy: '©',
		reg: '®',
		lt: '<',
		gt: '>',
		quot: '"',
		amp: '&',
		apos: '\'',
		prime: "\'",
		Prime: "\""
	};
	return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
		let match;

		if (entityCode in htmlEntities) {
			return htmlEntities[entityCode];
		} else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
			return String.fromCharCode(parseInt(match[1], 16));
		} else if (match = entityCode.match(/^#(\d+)$/)) {
			return String.fromCharCode(~~match[1]);
		} else {
			return entity;
		}
	});
}

function makerandomthing(length) {
	let result = '';
	let characters = '~-+=';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function sort(obj) {
	let arr = [];
	for (let name in obj) {
		arr.push({
			name,
			val: obj[name]
		})
	}
	let len = arr.length;
	for (let i = len - 1; i >= 0; i--) {
		for (let j = 1; j <= i; j++) {
			if (arr[j - 1].val > arr[j].val) {
				let temp = arr[j - 1];
				arr[j - 1] = arr[j];
				arr[j] = temp;
			}
		}
	}
	return arr;
}

// ch.onUserReceivedInvitation = (channel, inviter, invitees) => {
// 	if (userListContainsUser(invitees, sb.currentUser)) {
// 		console.log("I've been invited to a channel! :D");
// 		channel.acceptInvitation(function() {
// 			sendMsgWithChannel(channel, "Hi! I'm ChatPlaceBot. I got invited to this chat. To get help using me, do /help.");
// 		});
// 		console.log(`I've accepted the invite to ${channel.name}!`);
// 	}
// };
sb.addChannelHandler("vsdfh64mc93mg0cn367vne4m50bn3b238", ch);
let messageInterval = setInterval(function() {
	newsMessage(1);
	memesMessage(1);
	caveMessage(1);
}, 1000 * 60 * 60 * 24);

function exitHandler(exit) {
	fs.writeFileSync("data/rules.json", JSON.stringify(rules));
	fs.writeFileSync("data/quotes.json", JSON.stringify(quotes));
	fs.writeFileSync("data/exitMessages.json", JSON.stringify(exitMessages));
	fs.writeFileSync("data/welcomeMessages.json", JSON.stringify(welcomeMessages));
	if (exit) process.exit();
}

process.on('exit', exitHandler.bind(false));
process.on('SIGINT', exitHandler.bind(true));
process.on('SIGUSR1', exitHandler.bind(true));
process.on('SIGUSR2', exitHandler.bind(true));
process.on('uncaughtException', (err, origin) => {
	console.error(err);
	console.error(origin);
	exitHandler.bind(true);
});
