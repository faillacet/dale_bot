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

// CRON JOBS
const cron = require('./CronJobs.js');
cron.statUpdater.start();
cron.gameGrabber.start();

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

async function betOnSummoner(msg, cmd, against) {
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
        await DBConnector.createNewUser(msg.author.id, msg.author.username);
    }

    // Check If summoner is in a game
    let inGame = await DBConnector.isInGame(name);
    if (inGame.gameID === 0) {
        msg.channel.send(boxFormat('Summoner is not currently in a game'));
        return;
    }

    // Check to make sure game is in first 10 minutes
    if ((Date.now() - inGame.gameStartTime) > 600000) {
        msg.channel.send(boxFormat('Game started over 10 mins ago\nNo longer accepting bets on this match'));
        return;
    }

    currentlyBetting.push({better: msg.author.id, summoner: name});
    if (against) {
        msg.channel.send(boxFormat('100 points bet AGAINST ' + name));
    }
    else {
        msg.channel.send(boxFormat('100 points bet ON ' + name));
    }

    let time = 30000;
    await new Promise(resolve => setTimeout(resolve, 300000));  // wait 5mins
    while ((await DBConnector.isInGame(name)).gameID != 0) {
        // wait 1 minute (check every minute) - changes to 30 seconds after 25 minutes
        await new Promise(resolve => setTimeout(resolve, time));
    }
    
    // TEST THIS, may not show up on API Immediatly in some cases
    await new Promise(resolve => setTimeout(resolve, 15000));
    let win = await DBConnector.gameIsWin(inGame.gameID, inGame.sumId);
    if (win && against)  {
        await DBConnector.subtractPoints(msg.author.id);
        msg.channel.send("<@" + msg.author.id + ">");
        msg.channel.send(boxFormat("You bet AGAINST " + name + "\n" + name +" WON the game.\nYou LOST 100 points!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
    }
    else if (win && !against) {
        await DBConnector.addPoints(msg.author.id);
        msg.channel.send("<@" + msg.author.id + ">");
        msg.channel.send(boxFormat("You bet ON " + name + "\n" + name + " WON the game.\nYou WON 100 points!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
    }
    else if (!win && against) {
        await DBConnector.addPoints(msg.author.id);
        msg.channel.send("<@" + msg.author.id + ">");
        msg.channel.send(boxFormat("You bet AGINST " + name + "\n" + name + " LOST the game.\nYou WON 100 points!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
    }
    else if (!win && !against) {
        await DBConnector.subtractPoints(msg.author.id);
        msg.channel.send("<@" + msg.author.id + ">");
        msg.channel.send(boxFormat("You bet ON " + name + "\n" + name + " LOST the game.\nYou LOST 100 points!\nYou now have a total of " + (await DBConnector.getPoints(msg.author.id)) + " points."));
    }
    
    // Remove from Blocker
    for (let i = 0; i < currentlyBetting.length; i++) {
        if (currentlyBetting[i].better === msg.author.id && currentlyBetting[i].summoner === name) {
            currentlyBetting.splice(i, i+1);
            return;
        }
    }
}

async function printBettingLeaderboard(msg) {
    try {
        let sortedPlayers = await DBConnector.getBettingLeaderboard(LBDISPLAYCOUNT);
        let output = "TOP BETTERS\n"
        for (let i = 0; i < sortedPlayers.length; i++) {
            output += (i + 1) + '- ' + sortedPlayers[i].name + 
            ': ' + sortedPlayers[i].points + ' Points\n';
        }
        msg.channel.send(boxFormat(output));
    }
    catch (e) {
        msg.channel.send("Error, check logs...");
        console.log(e);
    }
}

async function checkForActiveGames(msg) {
    let sumList = await DBConnector.getAllStoredSummoners();
    for (let i = 0; i < sumList.length; i++) {
        // 10 Second Wait
        await new Promise(resolve => setTimeout(resolve, 10000));

        if ((await DBConnector.isInGame(sumList[i].name)).gameID != 0) {
            msg.channel.send(boxFormat("SUMMONER: " + sumList[i].name + " IS NOW IN GAME"))
        }
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
        else if (msg.content === "!bettingLeaderboard") {
            printBettingLeaderboard(msg);
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
            betOnSummoner(msg, '!betOn', false);
        }
        else if (msg.content.includes('!betAgainst')) {
            betOnSummoner(msg, '!betAgainst', true);
        }
    } 
});

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
