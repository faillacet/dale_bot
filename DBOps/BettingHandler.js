const Helper = require("../MiscClasses/HelperFunctions.js");
const DBConnector = require("./DBConnector.js");

class BettingHandler {
    constructor() {
        this.activeGames = new Map();   // Key is sumName
        this.activeBets = [];

        // Settings For This Class
        this.bettingWindow = 60000 * 3; // 3 minute window
        this.botId = '811340483720249375';
    }

    setChannel(chan) {
        this.channel = chan;
    }

    async getActiveGames() {
        try {
            // Select All Stored Summoners - then check if any are in game
            let summoners = await DBConnector.getAllStoredSummoners();
            for (const sum of summoners) {
                let gameData = await DBConnector.getInGameData(sum.name);
                // game found, if DNE add to activeGames
                if (gameData != -1) {
                    if (!this.activeGames.has(gameData.sumName)) {  
                        this.activeGames.set(gameData.sumName, gameData);
                        this.getBetsForSummoner(this.activeGames.get(gameData.sumName));
                    }
                }
                // game over, handle bets + remove from activeGames
                else {
                    if (this.activeGames.has(sum.name)) {
                        let aGame = this.activeGames.get(sum.name);
                        // Check to see if game was remake
                        if (await DBConnector.gameIsRemake(aGame.gameId)) {
                            this.handleRemake(aGame);
                        }
                        else {
                            await this.payoutBets(aGame);
                            this.activeGames.delete(sum.name);
                        }
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    async getBetsForSummoner(gameObj) {
        try {
            // Bot Send Alert Msg
            let msg;
            if (gameObj.gameQueueId === 420) {
                msg = await this.channel.send(Helper.boxFormat("SUMMONER: " + gameObj.sumName + " IS NOW IN A RANKED GAME\nRANKED BETS ARE WORTH 3X\nPLACE BETS NOW!"));
            }
            else {
                msg = await this.channel.send(Helper.boxFormat("SUMMONER: " + gameObj.sumName + " IS NOW IN A NON-RANKED GAME\nPLACE BETS NOW!"));
            }
            msg.react('✅');
            msg.react('❌');

            // Now Collect Bets
            let count = 0;
            const filter = (reaction) => reaction.emoji.name === '✅' || reaction.emoji.name === '❌';
            let collected = await msg.awaitReactions(filter, {time: this.bettingWindow});
            collected.each(reaction => {
                if (reaction._emoji.name === '✅') {
                    reaction.users.cache.each(user => {
                        if (user.id != this.botId) {
                            this.activeBets.push({id: user.id, betterName: user.username, sumName: gameObj.sumName, on: true});
                            count++;
                        }
                    });
                }
                else if (reaction._emoji.name === '❌') {
                    reaction.users.cache.each(user => {
                        if (user.id != this.botId) {
                            this.activeBets.push({id: user.id, betterName: user.username, sumName: gameObj.sumName, on: false});
                            count++;
                        }
                    });
                }
            });

            // Bets Collected Send Alert
            let alert = "BETS FOR SUMMONER " + gameObj.sumName +" ARE NOW CLOSED\n";
            alert += "THERE ARE " + count + " TOTAL BETS ON THIS GAME\n";
            this.channel.send(Helper.boxFormat(alert));
        }
        catch (e) {
            console.log(e);
        }
    }

    async payoutBets(gameObj) {
        try {
            let betters = [];
            let win = await DBConnector.gameIsWin(gameObj.gameId, gameObj.sumPuuid);
            let i = 0;
            while (i < this.activeBets.length) {
                // If bet is on this game
                if (this.activeBets[i].sumName === gameObj.sumName) {
                    // Check if user acc in in DB, if not create profile
                    if (!(await DBConnector.userExists(this.activeBets[i].id))) {
                        await DBConnector.createNewUser(this.activeBets[i].id, this.activeBets[i].betterName);
                    }

                    // Payout Bets, Then Remove from bet arr
                    if (win && this.activeBets[i].on) {
                        betters.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName, win: true});
                    }
                    else if (!win && this.activeBets[i].on) {
                        betters.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName, win: false});
                    }
                    else if (win && !this.activeBets[i].on) {
                        betters.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName, win: false});
                    }
                    else {
                        betters.push({id: this.activeBets[i].id, name: this.activeBets[i].betterName, win: true});
                    }
                    this.activeBets.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            
            // Handled Bets, now payout and alert
            let alert;
            if (win) {
                alert = gameObj.sumName + " has WON the game\n";
            }
            else {
                alert = gameObj.sumName + " has LOST the game\n";
            }

            let winners = "";
            let loosers = "";
            let winExists = false;
            let lossExists = false;

            while (betters.length > 0) {
                if (betters[0].win === true) {
                    if (gameObj.gameQueueId === 420) {
                        await DBConnector.addPointsRanked(betters[0].id);
                    }
                    else {
                        await DBConnector.addPoints(betters[0].id);
                    }
                    winners += betters.shift().name + "\n";
                    winExists = true;
                } 
                else {
                    if (gameObj.gameQueueId === 420) {
                        await DBConnector.subtractPointsRanked(betters[0].id);
                    }
                    else {
                        await DBConnector.subtractPoints(betters[0].id);
                    }
                    loosers += betters.shift().name + "\n";
                    lossExists = true;
                }
            }

            if (winExists) {
                alert += "THE FOLLOWING USER HAVE WON THE BET:\n"
                alert += winners;
            }
            if (lossExists) {
                alert += "THE FOLLOWING USERS HAVE LOST THE BET:\n"
                alert += loosers;
            }
            this.channel.send(Helper.boxFormat(alert));
        }
        catch (e) {
            console.log(e);
        }
    }

    async handleRemake(gameObj) {
        try {
            // wait 30 seconds (to let bets happen)
            await new Promise(resolve => setTimeout(resolve, 30000));
            let i = 0;
            while (i < this.activeBets.length) {
                // If bet is on this game
                if (this.activeBets[i].sumName === gameObj.sumName) {
                    this.activeBets.splice(i, 1);
                }
                else {
                    i++;
                }
            }

            let alert = gameObj.sumName + "'s GAME ENDED IN REMAKE\nALL BETS ARE VOIDED"
            this.channel.send(Helper.boxFormat(alert));            
        }
        catch (e) {
            console.log(e);
        }
    }
}

const Betting = new BettingHandler();

//Betting.getActiveGames();

// TESTING
//Betting.getActiveGames();

module.exports = Betting;