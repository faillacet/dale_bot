require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

// Imports
const randomDaleMsg = require('./randomDaleMsg.js');
const randomTrantMsg = require('./randomTrantMsg.js');
const commandList = require('./commandList.js');
const DBConnector = require('./DBConnector.js')

// CRON JOBS, MOVE TO DIFF FILE SOON
// Global Updaters
const cron = require('cron');
let statUpdater = new cron.CronJob('00 00 * * * *', () => {
    console.log("UPDATED DB AT: " + Date.now());
    DBConnector.updateAllSummoners();
});
let gameGrabber = new cron.CronJob('00 00 03 * * *', () => {
    console.log("GRABBING MATCH HISTORY AT: " + Date.now());
    DBConnector.grabAllRankedGames();
});
statUpdater.start();
gameGrabber.start();

// BETTING FUNCTIONALITY

// Global Settings
let LBDISPLAYCOUNT = 10;
let DELETEDALEMSG = false;

// Helper function, move to module later
function boxFormat(string) {
    return "```\n" + string + "\n```";
}

// Functions 
function printHelpScreen(msg) {
    let output =  "HELP PAGE - AVAILABLE COMMANDS\n";
    for (let i = 0; i < commandList.length; i++) {
        output += commandList[i];
    }
    msg.channel.send(boxFormat(output));
}

function getRandomDaleMsg() {                                        
    var x = Math.floor(Math.random() * randomDaleMsg.length);
    return randomDaleMsg[x];
}

function getRandomTrantMsg() {                                       
    var x = Math.floor(Math.random() * randomTrantMsg.length);
    return randomTrantMsg[x];
}

function randomlyDeleteDaleMsg(msg, id) {
    if (msg.author.id === id) {
        var x = Math.random() * 500;
        if (x < 2) {
            msg.delete({timeout: 0})
            .then(msg => console.log('Deleted msg from DALE LOL'))
            .catch(console.error);
        }
    }
}

function fuqDale(msg) {
    if (msg.author.id === '173944478770397186' || msg.author.id === '201177301264629760') {
        if (DELETEDALEMSG) {
            DELETEDALEMSG = false;
            msg.channel.send(boxFormat('No longer fuqing dale...'));
        }
        else {
            DELETEDALEMSG = true;
            msg.channel.send(boxFormat('FUQ DALE!!!!'));
        }
    }
}

function setLBDisplayCount(msg, cmd) {
    let num = msg.toString().substr(cmd.length + 1, msg.content.length);
    if (num < 5) {
        msg.channel.send('Number cannot be less than 5.');
        return;
    }
    else if (num > 10) {
        msg.channel.send('Number cannot be greater than 10');
        return;
    }
    LBDISPLAYCOUNT = parseInt(num);
    msg.channel.send('Display Count Successfully Updated.');
}

async function printSummonerStats(msg, cmd) {
    let name = msg.toString().substr(cmd.length + 1, msg.content.length);
    try {
        let stats = await DBConnector.getStats(name);
        msg.channel.send('```\n' + stats.name + ': ' + stats.tier + ' ' + stats.sumRank + "\nLP: " + 
        stats.leaguePoints + "\nWins: " + stats.wins + "\nLosses: " + stats.losses + "\nWinrate: " + 
        stats.winrate + "%\n```");
    }
    catch (e) {
        msg.channel.send("Player DNE or unranked.");
        console.log(e);
    }
}

async function printRankLeaderboard(msg) {
    try {
        let sortedPlayers = await DBConnector.getRankLeaderboard(LBDISPLAYCOUNT);
        let output = "TOP PLAYERS BY RANK\n"
        let counter = 0;
        while (counter < LBDISPLAYCOUNT && counter < sortedPlayers.length) {
            output += (counter + 1) + '- ' + sortedPlayers[counter].name + ': ' + 
            sortedPlayers[counter].tier + ' ' + sortedPlayers[counter].sumRank + ' ' + 
            sortedPlayers[counter].leaguePoints + ' LP\n';
            counter++;
        }
        msg.channel.send(boxFormat(output));
    }
    catch (e) {
        msg.channel.send("Error, check logs...");
        console.log(e);
    }
}

async function printWRLeaderboard(msg) {
    try {
        let sortedPlayers = await DBConnector.getWRLeaderboard(LBDISPLAYCOUNT);
        let output = "TOP PLAYERS BY WIN RATE\n"
        let counter = 0;
        while (counter < LBDISPLAYCOUNT && counter < sortedPlayers.length) {
            output += (counter + 1) + '- ' + sortedPlayers[counter].name + 
            ': ' + sortedPlayers[counter].winrate + '%\n';
            counter++;
        }
        msg.channel.send(boxFormat(output));
    }
    catch (e) {
        msg.channel.send("Error, check logs...");
        console.log(e);
    }
}

async function deleteSummoner(msg, cmd) {
    let name = msg.toString().substr(cmd.length + 1, msg.content.length);
    try {
        
        let status = await DBConnector.deleteSummoner(name);
        if (status) {
            msg.channel.send(boxFormat("Summoner: " + name + " sucessfully deleted."))
        }
        else {
            msg.channel.send(boxFormat("Summoner not found."));
        }
    }
    catch (e) {
        msg.channel.send(boxFormat("Error, check logs."));
        console.log(e);
    }
    
}

async function updateSummoners(msg) {
    try {
        await DBConnector.updateAllSummoners();
        msg.channel.send(boxFormat('Database Sucessfully Updated.'));
    }
    catch (e) {
        msg.channel.send(boxFormat('Error, check logs.'));
        console.log(e);
    }
}

let currentlyBetting = [];

async function betOnSummoner(msg, cmd) {
    let name = msg.toString().substr(cmd.length + 1, msg.content.length);

    // Check If User is already Betting On this summoner
    for (let i = 0; i < currentlyBetting.length; i++) {
        if (currentlyBetting[i].better === msg.author.id && currentlyBetting[i].summoner === name) {
            msg.channel.send('You are already betting on this user...');
            return;
        }
    }

    // Check If User Is in DB, if NOT Create A Profile
    if (!(await DBConnector.userExists(msg.author.id))) {
        await DBConnector.createNewUser(msg.author.id);
    }

    let inGame = await DBConnector.isInGame(name);
    if (inGame.gameID != 0) {
        currentlyBetting.push({better: msg.author.id, summoner: name});
        msg.channel.send(boxFormat('100 Points Successfully bet on ' + name));
        let count = 0;
        let time = 60000;
        while ((await DBConnector.isInGame(name)).gameID != 0) {
            // wait 1 minute (check every minute) - changes to 30 seconds after 25 minutes
            await new Promise(resolve => setTimeout(resolve, time));
            count++;
            if (count == 25) {
                time = 30000;
            }
        }
        
        // TEST THIS, may not show up on API Immediatly in some cases
        let win = await DBConnector.gameIsWin(inGame.gameID, inGame.sumId);
        if (win) {
            await DBConnector.addPoints(msg.author.id);
            msg.channel.send(`${msg.author.username}`);
            msg.channel.send(boxFormat(name +" won the game.\nYOU WON 100 POINTS!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
        }
        else {
            await DBConnector.subtractPoints(msg.author.id);
            msg.channel.send(`${msg.author.username}`);
            msg.channel.send(boxFormat(name+ " lost the game.\nYOU LOST 100 POINTS!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
        }

        for (let i = 0; i < currentlyBetting.length; i++) {
            if (currentlyBetting[i].better === msg.author.id && currentlyBetting[i].summoner === name) {
                currentlyBetting.splice(i, i+1);
                return;
            }
        }
    }
    else {
        msg.channel.send(boxFormat('Summoner is not currently in a game'));
    }
}

async function betAgainstSummoner(msg, cmd) {
    // Check If User is already Betting On this summoner
    for (let i = 0; i < currentlyBetting.length; i++) {
        if (currentlyBetting[i].better === msg.author.id && currentlyBetting[i].summoner === name) {
            msg.channel.send('You are already betting on this user...');
            return;
        }
    }

    // Check If User Is in DB, if NOT Create A Profile
    if (!(await DBConnector.userExists(msg.author.id))) {
        await DBConnector.createNewUser(msg.author.id);
    }

    let name = msg.toString().substr(cmd.length + 1, msg.content.length);
    let inGame = await DBConnector.isInGame(name);
    if (inGame.gameID != 0) {
        currentlyBetting.push({better: msg.author.id, summoner: name});
        msg.channel.send(boxFormat('100 Points Successfully bet against ' + name));
        let count = 0;
        let time = 60000;
        while ((await DBConnector.isInGame(name)).gameID != 0) {
            // wait 1 minute (check every minute) - changes to 30 seconds after 25 minutes
            await new Promise(resolve => setTimeout(resolve, time));
            count++;
            if (count == 25) {
                time = 30000;
            }
        }
        
        // TEST THIS, may not show up on API Immediatly in some cases
        let win = await DBConnector.gameIsWin(inGame.gameID, inGame.sumId);
        if (!win) {
            await DBConnector.addPoints(msg.author.id);
            msg.channel.send(`${msg.author.username}`);
            msg.channel.send(boxFormat(name +" lost the game.\nYOU WON 100 POINTS!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
        }
        else {
            await DBConnector.subtractPoints(msg.author.id);
            msg.channel.send(`${msg.author.username}`);
            msg.channel.send(boxFormat(name+ " won the game.\nYOU LOST 100 POINTS!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
        }

        for (let i = 0; i < currentlyBetting.length; i++) {
            if (currentlyBetting[i].better === msg.author.id && currentlyBetting[i].summoner === name) {
                currentlyBetting.splice(i, i+1);
                return;
            }
        }
    }
    else {
        msg.channel.send(boxFormat('Summoner is not currently in a game'));
    }
}

// Listen for "ready" Event
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setUsername("dodger dale");
});

// Listen for "message" Event
// msg.reply: tags the initial user who sent the message
// msg.channel.send: sends a message to the channnel without tagging anyone
bot.on('message', msg => {

    randomlyDeleteDaleMsg(msg, "218225932886867968");
    if (msg.author.id === '218225932886867968' && DELETEDALEMSG) {
        msg.delete()
        .then(() => console.log('Deleted msg from DALE LOL'))
        .catch(console.error);
    }

    // Check Each Msg to see if it is a possible command (so command search isnt done on every message)
    if (msg.content[0] === '!') {
        if (msg.content === "!help") {
            printHelpScreen(msg);
        }
        else if (msg.content === "!daleMsg") {                                                   
            msg.channel.send(getRandomDaleMsg());
        }
        else if (msg.content === "!trantMsg") {                                             
            msg.channel.send(getRandomTrantMsg());
        }
        else if (msg.content === "!fuqDale") {
            fuqDale(msg);
        }
        else if (msg.content === "!updateSummoners") {
            updateSummoners(msg);
        }
        else if (msg.content === "!rankLeaderboard") {
            printRankLeaderboard(msg);
        }
        else if (msg.content === "!winrateLeaderboard") {
            printWRLeaderboard(msg);
        }
        else if (msg.content.includes("!stats")) {
            printSummonerStats(msg, "!stats");
        }
        else if (msg.content.includes("!deleteSummoner")) {
            deleteSummoner(msg, "!deleteSummoner");
        }
        else if (msg.content.includes("!setDisplayCount")) {
            setLBDisplayCount(msg, "!setDisplayCount");
        }
        else if (msg.content.includes('!betOn')) {
            betOnSummoner(msg, '!betOn');
        }
        else if (msg.content.includes('!betAgainst')) {
            betAgainstSummoner(msg, '!betAgainst');
        }
    } 
});

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
