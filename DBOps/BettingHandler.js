const Helper = require("../MiscClasses/HelperFunctions.js");
const DBConnector = require("./DBConnector.js");

class BettingHandler {
    constructor() {
        this.activeGames = [];
        this.activeBets = [];
        this.channel;
    }

    setChannel(chan) {
        this.channel = chan;
    }

    async updateActiveGames() {
        try {
            let sumArr = await DBConnector.getAllStoredSummoners();
            for (let i = 0; i < sumArr.length; i++) {
                let temp = await DBConnector.isInGame(sumArr[i].name);
                if (temp.gameID != 0) {
                    let match = false;
                    for (let j = 0; j < this.activeGames.length; j++) {
                        if (sumArr[i].name === this.activeGames[j].name) {
                            match = true;
                        }
                    }
                    if (!match) {
                        this.activeGames.push({name: sumArr[i].name, alerted: false, gameOver: false, gameId: temp.gameID, puuid: temp.sumId});
                    }
                }
                // Summoner NOT in a game
                else {
                    for (let j = 0; j < this.activeGames.length; j++) {
                        // game finshed, boot from list
                        if (this.activeGames[j].name === sumArr[i].name) {
                            this.activeGames[j].gameOver = true;
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async alertGameStart() {
        try {
            // For each new sum in game, alert and open bets
            for (let i = 0; i < this.activeGames.length; i++) {
                if (this.activeGames[i].alerted === false) {
                    let msg = await this.channel.send(Helper.boxFormat("SUMMONER: " + this.activeGames[i].name + " IS NOW IN GAME\nPLACE BETS NOW!"));
                    msg.react('✅');
                    msg.react('❌');
                    this.getBets(msg, this.activeGames[i].name);
                    this.activeGames[i].alerted = true;
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async getBets(msg, name) {
        try {
            let countOn = 0;
            let countAgainst = 0;
            // Allow 5 Minutes to recieve bets
            const filter = (reaction, user) => (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') && user.id != '811340483720249375';
            let collected = await msg.awaitReactions(filter, {time: 1000 * 60 * 5});
            await collected.each(reaction => {
                if (reaction._emoji.name === '✅') {
                    this.activeBets.push({id: reaction.message.author.id, on: true, sumName: name, betterName: reaction.message.author.username});
                    countOn++;
                }
                else {
                    this.activeBets.push({id: reaction.message.author.id, on: false, sumName: name, betterName: reaction.message.author.username});
                    countAgainst++;
                }
            });

            // After recieving all the bets let users know lock-in is over
            let alert = "BETS FOR SUMMONER " + name +" NOW CLOSED\n"
            if (countOn > 0) {
                alert += "THERE ARE " + countOn + " BETS ON THIS SUMMONER\n"
            }
            else if (countAgainst > 0) {
                alert += "THERE ARE " + countAgainst + " BETS AGAINST THIS SUMMONER\n"
            }
            this.channel.send(Helper.boxFormat(alert));
        }
        catch (e) {
            console.log(e);
        }
    }

    async getFinishedGames() {
        try {
            // Game finshed, handle all bets
            for (let i = 0; i < this.activeGames.length; i++) {
                if (this.activeGames[i].gameOver === true) {
                    await this.completeBets(this.activeGames[i]);
                    this.activeGames.splice(i, 1);
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    
    async completeBets(activeGameObj) {
        try {
            let winners = [];
            let loosers = [];
            let win = await DBConnector.gameIsWin(activeGameObj.gameId, activeGameObj.puuid);
            let i = 0;
            while (i < this.activeBets.length) {
                if (this.activeBets.sumName === activeGameObj.name) {
                    if (win && this.activeBets[i].on) {
                        winners.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName});
                    }
                    else if (!win && this.activeBets.on) {
                        loosers.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName});
                    }
                    else if (win && !this.activeBets.on) {
                        loosers.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName});
                    }
                    else {
                        winners.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName});
                    }
                    this.activeBets.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
           
            // Got All our winners and looser, now alert
            let userAlert;
            if (win) {
                userAlert = activeGameObj.name + " has WON the game.\n"; 
            }
            else {
                userAlert = activeGameObj.name + " has LOST the game.\n";
            }
        
            userAlert += "THE FOLLOWING USERS HAVE WON THE BET:\n";
            for (let i = 0; i < winners.length; i++) {
                userAlert += winners[i].name + "\n";
                // Check If User Is in DB, if NOT Create A Profile
                if (!(await DBConnector.userExists(winners[i].id))) {
                    await DBConnector.createNewUser(winners[i].id, winners[i].name);
                }
                await DBConnector.addPoints(winners[i].id);
            }
            userAlert += "\nTHE FOLLOWING USERs HAVE LOST THE BET:\n";
            for (let i = 0; i < loosers.length; i++) {
                userAlert += loosers[i].name + "\n";
                // Check If User Is in DB, if NOT Create A Profile
                if (!(await DBConnector.userExists(loosers[i].id))) {
                    await DBConnector.createNewUser(loosers[i].id, loosers[i].name);
                }
                await DBConnector.subtractPoints(loosers[i].id);
            }
        
            this.channel.send(Helper.boxFormat(userAlert));
        }
        catch(e) {
            console.log(e);
        }
    }

    async updateBetting() {
        try {
            await this.updateActiveGames();
            this.alertGameStart();
            this.getFinishedGames();            
        }
        catch (e) {
            console.log(e);
        }
    }
}

const Betting = new BettingHandler();

module.exports = Betting;