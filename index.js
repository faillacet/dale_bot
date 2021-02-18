const randomMsg = require('./randomMsg.js');
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

// Test Purposes, pulling infornmation from dictionary.js
console.log(randomMsg[0]);

// Listen for "ready" Event
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setUsername("dodger dale");
});

// Listen for "message" Event
// msg.reply: tags the initial user who sent the message
// msg.channel.send: sends a message to the channnel without tagging anyone
bot.on('message', msg => {
    // Dale mentioned
    if (msg.content === 'dale' || msg.content === 'Dale'  || msg.content === 'DALE') {
        //msg.reply('Srry I no game, I dodge');
        msg.channel.send("Henlo friends");
    }
     
    // On Event Dale Sends A Message
    if (msg.author.id === "218225932886867968") {
        var x = Math.random() * 1000;
        if (x < 5) {
            msg.delete({timeout: 0}).then(msg => console.log('Deleted msg from DALE LOL')).catch(console.error);
        }
        else if (msg.content.includes("game")) {
            msg.channel.send("SIKE I DONT PLAY GAMES!!! --- ps sry dale this is an experimental feature");
        }
    }
 
    // On Event Trenton Sends A Message
    if (msg.author.id === "173944478770397186" && msg.content.includes("tacoman")) {
        msg.edit("I coom haha").then(msg => console.log(`IT WORKS thank you very much`)).catch(console.error);
        
    }

    // Mo's Test
    if (msg.author.id === "173944478770397186" && msg.content.includes("tacoman")) {
        //msg.edit("I coom haha").then(msg => console.log(`IT WORKS thank you very much`)).catch(console.error);
        message.edit("I COOM")
        .then(msg => console.log(`Updated the content of a message to ${msg.content}`))
        .catch(console.error);
    }


    // Dale games request responses
    if(msg.content === "dale do you want to game?" || msg.content === "dale games?" || msg.content.includes("games?")) {
        var x = Math.floor(Math.random() * 6) + 1; // returns value from 1 to 5 
        
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

});

// Play despacito
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
});

// Heroku Server Connection 
bot.login(process.env.TOKEN); // TOKEN is the CLient Secret

/* TODO:
 - create a randomized event for dale-bot to post in chat "anyone want to go to wendy's?"
 - create spontaneous messages.
*/
