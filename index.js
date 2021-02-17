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
    if (msg.content === 'dale' || msg.content === 'Dale'  || msg.content === 'DALE') {
        //msg.reply('Srry I no game, I dodge');
        msg.channel.send("Henlo friends");
    }
     
    if(msg.content === "dale do you want to game?" || msg.content === "dale games?") {
        var x = Math.random() * 5;
        if (x >= 0 && x < 1) {
            msg.channel.send("Srry I have to go make a sandwich");
        }
        else if (x >= 1 && x < 2) {
            msg.channel.send("Srry I have to go take a shower");
        }
        else if (x >= 2 && x < 3) {
            msg.channel.send("Srry I have to go walk my cat");   
        }
        else if (x >= 3 && x < 4) {
            msg.channel.send("Srry I have to go tan my head");    
        }
        else if (x >= 4 && x <=5) {
            msg.channel.send("Srry I have to go ask my dad for more bandwith");    
        }
    }
    
    // Play Despacito event
    if (msg.content === 'alexa play despacito') {
        msg.channel.send("!play lana del rey sexy moments 2018");
    }
});
