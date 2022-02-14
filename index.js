require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

// Imports
const RandEvent = require("./RandomEvents/RandomEvent.js");
const Helper = require("./MiscClasses/HelperFunctions.js");
const Print = require("./MiscClasses/PrintToChannel.js");
const DBCommand = require("./DBOps/DBCommands.js");
const Betting = require("./DBOps/BettingHandler.js");
const cron = require('./MiscClasses/CronJobs.js');

// Global Settings
const MAINCHANNELID = '600446077769875467'; // KuttieKittenDodginRoom Main Channel

// Listen for "ready" Event
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setUsername("dodger dale");
    let MAINCHANNEL = bot.channels.cache.get(MAINCHANNELID);

    // Start Cron Jobs
    Betting.setChannel(MAINCHANNEL);
    cron.statUpdater.start();
    cron.gameGrabber.start();
    cron.runBetting.start();
});


function handleCommands(msg) {
    // Print Stuff Functions
    if (msg.content === "!help") {
        Print.printHelpScreen(msg);
    }
    else if (msg.content === "!rankLB") {
        Print.printRankLeaderboard(msg);
    }
    else if (msg.content === "!winrateLB") {
        Print.printWRLeaderboard(msg);
    }
    else if (msg.content === "!bettingLB") {
        Print.printBettingLeaderboard(msg);
    }
    else if (msg.content === "!points") {
        Print.printUsersPoints(msg);
    }
    else if (msg.content.includes("!stats")) {
        Print.printSummonerStats(msg, "!stats");
    }
    else if (msg.content.includes("!setDisplayCount")) {
        Print.setLBDisplayCount(msg, "!setDisplayCount");
    }

    // Random Events
    else if (msg.content === "!daleMsg") {                                                   
        RandEvent.printRandomDaleMsg(msg);
    }
    else if (msg.content === "!trantMsg") {                                             
        RandEvent.printRandomTrantMsg(msg);
    }

    // Admin/Redeemable Functions --- TODO ORGANIZE THIS
    else if (msg.content.includes("!reactUser")) {
        Helper.addReactUser(msg, "!reactUser");
    }
    else if (msg.content.includes("!muteUser")) {
        Helper.muteUser(msg, "!muteUser");
    }

    // Misc DB functions
    else if (msg.content === "!updateSummoners") {
        DBCommand.updateSummoners(msg);
    }
    else if (msg.content.includes("!deleteSummoner")) {
        DBCommand.deleteSummoner(msg, "!deleteSummoner");
    }
}

// Listen for "message" Event
// msg.reply: tags the initial user who sent the message
// msg.channel.send: sends a message to the channnel without tagging anyone
bot.on('message', msg => {

    if (Helper.inList(msg.author.tag, Helper.reactUser)) {
        msg.react("🥲");
    }
    if (Helper.inList(msg.author.tag, Helper.userMuted)) {
        msg.delete();
    }

    // if (msg.author.id === '218225932886867968' && Helper.muteDale) {
    //     msg.delete()
    //     .then(() => console.log('Deleted msg from DALE LOL'))
    //     .catch(console.error);
    // }

    // Check Each Msg to see if it is a possible command (so command search isnt done on every message)
    if (msg.content[0] === '!') {
        handleCommands(msg);
    } 
});