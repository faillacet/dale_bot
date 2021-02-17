require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

// Listen for "ready" Event
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

// Listen for "message" Event
// msg.reply: tags the initial user who sent the message
// msg.channel.send: sends a message to the channnel without tagging anyone
bot.on('message', msg => {
    if (msg.content === 'dale' || msg.content === 'Dale'  || msg.content === 'DALE'}) {
        //msg.reply('Srry I no game, I dodge');
        msg.channel.send("Henlo friends");
    }
     
    if(msg.content === "dale do you want to game?" || msg.content === "dale games?") {
        msg.channel.send("Srry I have to go make a sandwich");
    }
    // Play Despacito event
    if (msg.content === 'alexa play despacito') {
        msg.channel.send("!play lana del rey sexy moments 2018");
    }
});
