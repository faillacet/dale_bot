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
    if (msg.content === 'dale' || msg.content === 'Dale') {
        //msg.reply('Srry I no game, I dodge');
        msg.channel.send("Srry I no game, I dodge");
    }

    // Play Despacito event
    if (msg.content === 'alexa play despacito') {
        msg.reply('!play lana del ray sexy moments 2018');
        msg.channel.send("!play lana del ray sexy moments 2018");
    }
});
