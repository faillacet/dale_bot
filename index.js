const randomMsg = require('./randomMsg.js');
const randomTrantMsg = require('./randomTrantMsg.js');
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

// Test Purposes, pulling infornmation from dictionary.js
console.log(randomMsg[0]);

function getRandomDaleMsg() {
    var x = Math.floor(Math.random() * randomMsg.length);
    return randomMsg[x];
}

function getRandomTrantMsg() {
    var x = Math.floor(Math.random() * randomTrantMsg.length);
    return randomTrantMsg[x];
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

    if (msg.author.id === "218225932886867968") {                                       // Condition Dale Sends a msg --- 5/1000 chance to delete msg
        var x = Math.random() * 1000;
        if (x < 5) {
            msg.delete({timeout: 0}).then(msg => console.log('Deleted msg from DALE LOL')).catch(console.error);    // 5/1000 chance to delete his msg
        }
    }

    if (msg.content === "!daleMsg") {                                                   // Command "!daleMsg" gives custom dale msg
        msg.channel.send(getRandomDaleMsg());
    }
    else if (msg.content === "!trantMsg") {                                             // Command "!trantMsg" gives custom trant msg
        msg.channel.send(getRandomTrantMsg());
    }
    else if (msg.content.includes("games?") || msg.content.includes("game?")) {         // Condition msg includes "games?" ---  Return 1 of 6 automated msgs
        var x = Math.floor(Math.random() * 6) + 1; // returns value from 1 to 6
        if (x === 1) {
            msg.channel.send("Srry I have to go make a sandwich");
        }
        else if (x === 2) {
            msg.channel.send("Srry I have to go take a shower");
        }
        else if (x === 3) {
            msg.channel.send("Srry I have to go walk my cat");
        }
        else if (x === 4) {
            msg.channel.send("Srry I have to go tan my head");
        }
        else if (x === 5) {
            msg.channel.send("Srry I have to go ask my dad for more bandwidth");
        }
        else if (x === 6) {
            msg.channel.send("https://tenor.com/view/mega-force-tomorrow-thumb-kiss-see-you-tomorrow-gif-11618001");
        }
    }
    else if (msg.content === 'dale' || msg.content === 'Dale'  || msg.content === 'DALE') {  // Condition "Dale" Mentioned in chat
        msg.channel.send("Henlo friends");                                              // Print text to channel
    }
    else if (msg.content.includes("a") || msg.content.includes("i")) {                       // Condition Any Msg has "a" or "i" in it --- uses get random msg function
        var x = Math.random() * 5;                                                     // Make condition better later
        if (x < 1) {
            msg.channel.send(getRandomMsg());
        }
    }

});

bot.on('message', async message => {
    // Join same channel as author
    if(message.content === "alexa play despacito") {
        // Check if user is in a voice channel
        if(message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            message.channel.send("!play despacito remix");
        }
    }

    if(message.content.includes("deez")) {
    message.delete({ timeout: 5000 })
    .then(msg => console.log(`Deleted message from ${msg.author.username} after 5 seconds`))
    .catch(console.error);
    }

    if(message.content.includes("coom")) {
        message.edit("I COOM");
        message.react("👋");
    }
});

// Heroku Server Connection
bot.login(process.env.TOKEN); // TOKEN is the CLient Secret

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
