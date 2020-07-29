# TrogloBot

## TROGLOBOT IS OFFICIALLY DISCONTINUED.

## Setup:
 - run `npm install -g`
 - run `node main.js` (optionally `node controller.js`to make use of the `$launch` command)

## Miscellaneous Command Syntax

These are commands that are only in here for fun or small tasks that don't need seperate programming

### PRESET 1: THE STRUCTURE OF A COMMAND
```
"example":["You just did /example!"]
```
This command will react to /example with "You just did /example"

### PRESET 2: SPECIAL COMMAND THINGS
```
"tellmemyname":["Your name is: %(SENDER)"]
```
This command will react to /tellmemyname with the sender's name

### PRESET 3: ARG1
```
"echothefirstword":["%(ARG1)"]
```
This command will react to "/echothefirstword Yeet The Baby" with "Yeet"

### PRESET 4: ALLARGS
```
"echo":["%(ALLARGS)"]
```
This command will react to "/echo Yeet The Baby" with "Yeet The Baby"

### PRESET 5: ALLARGSAFTER1
```
"tell":["Hey %(ARG1), you've been told: %(ALLARGSAFTER1)]"
```
