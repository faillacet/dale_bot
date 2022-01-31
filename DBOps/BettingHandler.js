const Helper = require("../MiscClasses/HelperFunctions.js");
const DBConnector = require("./DBConnector.js");

class BettingHandler {
    constructor() {
        this.currentlyBetting = [];
    }

    async betOnSummoner(msg, cmd, against) {
        let name = msg.toString().substr(cmd.length + 1, msg.content.length);
    
        // Check If User is already Betting On this summoner
        for (let i = 0; i < this.currentlyBetting.length; i++) {
            if (this.currentlyBetting[i].better === msg.author.id && this.currentlyBetting[i].summoner === name) {
                msg.channel.send('You are already betting on this user...');
                return;
            }
        }
    
        // Check If User Is in DB, if NOT Create A Profile
        if (!(await DBConnector.userExists(msg.author.id))) {
            await DBConnector.createNewUser(msg.author.id, msg.author.username);
        }
    
        // Check If summoner is in a game
        let inGame = await DBConnector.isInGame(name);
        if (inGame.gameID === 0) {
            msg.channel.send(Helper.boxFormat('Summoner is not currently in a game'));
            return;
        }
    
        // Check to make sure game is in first 10 minutes
        if ((Date.now() - inGame.gameStartTime) > 600000) {
            msg.channel.send(Helper.boxFormat('Game started over 10 mins ago\nNo longer accepting bets on this match'));
            return;
        }
    
        // Add To Currently Betting List and send confirmation
        this.currentlyBetting.push({better: msg.author.id, summoner: name, isAgainst: against, betterName: msg.author.username});
        if (against) {
            msg.channel.send(Helper.boxFormat('100 points bet AGAINST ' + name));
        }
        else {
            msg.channel.send(Helper.boxFormat('100 points bet ON ' + name));
        }
    
        // If this function is already in use, can exit here so only one instance exists
        for (let i = 0; i < this.currentlyBetting.length; i++) {
            if (this.currentlyBetting[i].better != msg.author.id && this.currentlyBetting[i].summoner === name) {
                return;
            }
        }
    
        let time = 30000;
        await new Promise(resolve => setTimeout(resolve, 300000));  // wait 5mins
        while ((await DBConnector.isInGame(name)).gameID != 0) {
            // wait 1 minute (check every 30 seconds)
            await new Promise(resolve => setTimeout(resolve, time));
        }
        
        // TEST THIS, may not show up on API Immediatly in some cases
        await new Promise(resolve => setTimeout(resolve, 15000));
        let win = await DBConnector.gameIsWin(inGame.gameID, inGame.sumId);
    
        // Get all users betting on this (local) summoner
        let localBetting = [];
        for (let i = 0; i < this.currentlyBetting.length; i++) {
            if (this.currentlyBetting[i].summoner === name) {
                localBetting.push({better: this.currentlyBetting[i].better, isAgainst: this.currentlyBetting[i].isAgainst, betterName: this.currentlyBetting[i].betterName});
            }
        }
    
        // Determine who won or lost the bet
        let winners = [];
        let loosers = [];
        for (let i = 0; i < localBetting.length; i++) {
            if (localBetting[i].isAgainst && win) {
                loosers.push({better: localBetting[i].better, betterName: localBetting[i].betterName});
            }
            else if (localBetting[i].isAgainst && !win) {
                winners.push({better: localBetting[i].better, betterName: localBetting[i].betterName});
            }
            else if (!localBetting[i].isAgainst && win) {
                winners.push({better: localBetting[i].better, betterName: localBetting[i].betterName});
            }
            else {
                loosers.push({better: localBetting[i].better, betterName: localBetting[i].betterName});
            }
        }
    
        // Create msg alerting winners and loosers
        let userAlert;
        if (win) {
            userAlert = name + " has WON the game.\n"; 
        }
        else {
            userAlert = name + " has LOST the game.\n";
        }
    
        userAlert += "THE FOLLOWING USERS HAVE WON THE BET:\n";
        for (let i = 0; i < winners.length; i++) {
            userAlert += winners[i].betterName + "\n";
            await DBConnector.addPoints(winners[i].better);
        }
        userAlert += "\nTHE FOLLOWING USERs HAVE LOST THE BET:\n";
        for (let i = 0; i < loosers.length; i++) {
            userAlert += loosers[i].betterName + "\n";
            await DBConnector.subtractPoints(loosers[i].better);
        }
    
        msg.channel.send(Helper.boxFormat(userAlert));
        
        // Remove from Blocker
        let index = 0;
        while (index < this.currentlyBetting.length) {
            if (this.currentlyBetting[index].summoner === name) {
                this.currentlyBetting.splice(index, 1);
            }
            else {
                ++index;
            }
        }
        return;
    }
}

const Betting = new BettingHandler();

module.exports = Betting;