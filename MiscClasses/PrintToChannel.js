const Helper = require("./HelperFunctions.js");
const commandList = require('./commandList.js');
const DBConnector = require('../DBOps/DBConnector.js')

class PrintToChannel {
    constructor() {
        this.displayCount = 10;
    }

    setLBDisplayCount(msg, cmd) {
        let num = parseInt(msg.toString().substr(cmd.length + 1, msg.content.length));
        if (num < 5) {
            msg.channel.send('Number cannot be less than 5.');
            return;
        }
        else if (num > 15) {
            msg.channel.send('Number cannot be greater than 15.');
            return;
        }
        this.displayCount = num
        msg.channel.send('Display Count Successfully Updated.');
    }

    printHelpScreen(msg) {
        let output =  "HELP PAGE - AVAILABLE COMMANDS\n";
        for (let i = 0; i < commandList.length; i++) {
            output += commandList[i];
        }
        msg.channel.send(Helper.boxFormat(output));
    }

    async printSummonerStats(msg, cmd) {
        let name = msg.toString().substr(cmd.length + 1, msg.content.length);
        try {
            let stats = await DBConnector.getStats(name);
            msg.channel.send('```\n' + stats.name + '\nRank: ' + stats.tier + ' ' + stats.sumRank + "\nLP: " + 
            stats.leaguePoints + "\nWins: " + stats.wins + "\nLosses: " + stats.losses + "\nWinrate: " + 
            stats.winrate + "%\n```");
        }
        catch (e) {
            msg.channel.send("Player DNE or unranked.");
            console.log(e);
        }
    }
    
    async printRankLeaderboard(msg) {
        try {
            let sortedPlayers = await DBConnector.getRankLeaderboard(this.displayCount);
            let output = "TOP PLAYERS BY RANK\n"
            let counter = 0;
            while (counter < this.displayCount && counter < sortedPlayers.length) {
                output += (counter + 1) + '- ' + sortedPlayers[counter].name + ': ' + 
                sortedPlayers[counter].tier + ' ' + sortedPlayers[counter].sumRank + ' ' + 
                sortedPlayers[counter].leaguePoints + ' LP\n';
                counter++;
            }
            msg.channel.send(Helper.boxFormat(output));
        }
        catch (e) {
            msg.channel.send("Error, check logs...");
            console.log(e);
        }
    }

    async printWRLeaderboard(msg) {
        try {
            let sortedPlayers = await DBConnector.getWRLeaderboard(this.displayCount);
            let output = "TOP PLAYERS BY WIN RATE\n"
            let counter = 0;
            while (counter < this.displayCount && counter < sortedPlayers.length) {
                output += (counter + 1) + '- ' + sortedPlayers[counter].name + 
                ': ' + sortedPlayers[counter].winrate + '%\n';
                counter++;
            }
            msg.channel.send(Helper.boxFormat(output));
        }
        catch (e) {
            msg.channel.send("Error, check logs...");
            console.log(e);
        }
    }

    async printBettingLeaderboard(msg) {
        try {
            let sortedPlayers = await DBConnector.getBettingLeaderboard(this.displayCount);
            let output = "TOP BETTERS\n"
            for (let i = 0; i < sortedPlayers.length; i++) {
                output += (i + 1) + '- ' + sortedPlayers[i].name + 
                ': ' + sortedPlayers[i].points + ' Points\n';
            }
            msg.channel.send(Helper.boxFormat(output));
        }
        catch (e) {
            msg.channel.send("Error, check logs...");
            console.log(e);
        }
    }

    async printUsersPoints(msg) {
        try {
            // Check to See if betting profile exists, if not create
            if (!(await DBConnector.userExists(msg.author.id))) {
                await DBConnector.createNewUser(msg.author.id, msg.author.username);
            }
    
            let points = await DBConnector.getPoints(msg.author.id);
            msg.channel.send(Helper.boxFormat("You currently have " + points  + " points."))
        }
        catch (e) {
            msg.channel.send("Error, check logs...");
            console.log(e);
        }
    }
}

const Print = new PrintToChannel();

module.exports = Print;