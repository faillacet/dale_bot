const randomMsg = require('./randomMsg.js');
const randomTrantMsg = require('./randomTrantMsg.js');
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

// Test Purposes, pulling infornmation from dictionary.js
console.log(randomMsg[0]);
console.log(randomTrantMsg[0]);

function getRandomDaleMsg() {                                        // gets random Dale Msg
    var x = Math.floor(Math.random() * randomMsg.length);
    return randomMsg[x];
}

function getRandomTrantMsg() {                                       // gets random Trant Msg
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

    if (msg.author.id == "299319601269964801" && msg.content.includes("http")) {
        //delete msg
        msg.delete({timeout: 0}).then(msg => console.log('Fuck Terri')).catch(console.error);
    }

    if (msg.content === "!daleMsg") {                                                   // Command "!daleMsg" gives custom dale msg
        msg.channel.send(getRandomDaleMsg());
    }
    else if (msg.content === "!trantMsg") {                                             // Command "!trantMsg" gives custom trant msg
        msg.channel.send(getRandomTrantMsg());
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
});

// Heroku Server Connection
bot.login(process.env.TOKEN); // TOKEN is the CLient Secret

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
