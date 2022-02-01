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

// CRON JOBS
const cron = require('./MiscClasses/CronJobs.js');

// Global Settings
const MAINCHANNELID = '600446077769875467';
let MAINCHANNEL;

// Listen for "ready" Event
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setUsername("dodger dale");
    MAINCHANNEL = bot.channels.cache.get(MAINCHANNELID);

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
    else if (msg.content === "!fuqDale") {
        Helper.fuqDale(msg);
    }
    else if (msg.content === "!test") {
        testingFunc(msg);
    }

    // Misc DB functions
    else if (msg.content === "!updateSummoners") {
        DBCommand.updateSummoners(msg);
    }
    else if (msg.content.includes("!deleteSummoner")) {
        DBCommand.deleteSummoner(msg, "!deleteSummoner");
    }

    // Betting Functions
    else if (msg.content.includes('!betOn')) {
        Betting.betOnSummoner(msg, '!betOn', false);
    }
    else if (msg.content.includes('!betAgainst')) {
        Betting.betOnSummoner(msg, '!betAgainst', true);
    }
}

// Listen for "message" Event
// msg.reply: tags the initial user who sent the message
// msg.channel.send: sends a message to the channnel without tagging anyone
bot.on('message', msg => {

    if (msg.author.id === '218225932886867968' && Helper.muteDale) {
        msg.delete()
        .then(() => console.log('Deleted msg from DALE LOL'))
        .catch(console.error);
    }

    // Check Each Msg to see if it is a possible command (so command search isnt done on every message)
    if (msg.content[0] === '!') {
        handleCommands(msg);
    } 
});

async function testingFunc(msg) {
    try {
        let botMessage = "test";
        let message = await msg.channel.send(Helper.boxFormat(botMessage));
        message.react('✅');
        message.react('❌');

        const filter = (reaction, user) => (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && user.id != '811340483720249375';

        // 5 minutes to place bets
        let collected = await message.awaitReactions(filter, {time: 1000 * 5});
        collected.each(reaction => {
            console.log(reaction.message.author.id);
        });
        //console.log(collected.entires());
       
    }
    catch (e) {
        console.log(e);
    }
    
}