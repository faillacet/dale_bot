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

// Legu Updater
const cron = require('cron');
let statUpdater = new cron.CronJob('00 00 * * * *', () => {
    console.log("UPDATED DB AT: " + Date.now());
    updateSummoners();
});
statUpdater.start();

// Global Settings
const LBDISPLAYCOUNT = 5;

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

    // Check Each Msg to see if it is a possible command (so command search isnt done on every message)
    if (msg.content[0] === '!') {
        if (msg.content === "!help") {
            printHelpScreen(msg);
        }
        if (msg.content === "!daleMsg") {                                                   
            msg.channel.send(getRandomDaleMsg());
        }
        else if (msg.content === "!trantMsg") {                                             
            msg.channel.send(getRandomTrantMsg());
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
    } 
});

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
