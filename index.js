// Bot Stuff
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

// Defined Messages
const randomDaleMsg = require('./randomDaleMsg.js');
const randomTrantMsg = require('./randomTrantMsg.js');

// Legu Stuff
const leagueConnector = require('./apiconnector.js');

// Functions 
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
            msg.delete({timeout: 0}).then(msg => console.log('Deleted msg from DALE LOL')).catch(console.error);
        }
    }
}

async function printSummonerStats(msg) {
    let name = msg.toString().substr(7, msg.content.length);
    try {
        let stats = await leagueConnector.getSummonerStats(name);
        msg.channel.send(stats.name + ': ' + stats.tier + ' ' + stats.rank + "\nWins: " + stats.wins + 
        "\nLosses: " + stats.losses + "\nWinrate: " + stats.winrate + "%");
    }
    catch (e) {
        msg.channel.send("Player DNE or unranked.");
        console.log(e);
    }
}

async function printLeaderboard(msg) {
    try {
        // TODO - actually print leaderboard (need to work on api end)
        console.log();
    }
    catch (e) {
        msg.channel.send("Error, check logs...");
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

    // Command Handling
    if (msg.content === "!daleMsg") {                                                   
        msg.channel.send(getRandomDaleMsg());
    }
    else if (msg.content === "!trantMsg") {                                             
        msg.channel.send(getRandomTrantMsg());
    }
    else if (msg.content === "!leaderboard") {
        printLeaderboard(msg);
    }
    else if (msg.content.includes("!stats")) {
        printSummonerStats(msg);
    }

    /* TODO - Make this work
    else if (msg.content.includes("!addDaleMsg")) {                                
        if (msg.content.slice(0,10) === "!addDaleMsg") {
            randomDaleMsg.appendArr(msg.content.slice(11))
            msg.channel.send("Sucessfully added Dale Msg <3")
        }
        else {
            msg.channel.send("Command not entered correctly, plz try again :)");
        }        
    }
    else if (msg.content === "!testAPI") {

    }
    */
});

// Heroku Server Connection
bot.login(process.env.TOKEN); // TOKEN is the CLient Secret

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
