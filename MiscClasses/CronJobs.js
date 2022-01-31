const cron = require('cron');
const DBConnector = require('../DBOps/DBConnector.js');
const Helper = require("../MiscClasses/HelperFunctions.js");

// Runs every hour
let statUpdater = new cron.CronJob('00 00 * * * *', () => {
    console.log("UPDATED DB AT: " + Date.now());
    DBConnector.updateAllSummoners();
});

// Runs at 3 AM
let gameGrabber = new cron.CronJob('00 00 03 * * *', () => {
    console.log("GRABBING MATCH HISTORY AT: " + Date.now());
    DBConnector.grabAllRankedGames();
});

let activeGames = [];
// Runs every 5 minutes
let checkForGames = new cron.CronJob('00 0/5 * * * *', (channel) => {
    checkForActiveGames(channel);
});

async function checkForActiveGames(channel) {
    try {
        let hit = [];
        let sumList = await DBConnector.getAllStoredSummoners();
        for (let i = 0; i < sumList.length; i++) {
            // 5 Second Wait
            await new Promise(resolve => setTimeout(resolve, 5000));
            if ((await DBConnector.isInGame(sumList[i].name)).gameID != 0) {
                hit.push(sumList[i].name);
            }
        }
        if (hit.length > 1) {
            let botMessage = "SUMMONERS: \n"
            for (let i = 0; i < hit.length; i++) {
                botMessage += hit[i] + "\n";
            }
            botMessage += "ARE NOW IN GAME\nPLACE BETS NOW!";
            channel.send(Helper.boxFormat(botMessage));
        }
        else if (hit.length === 1) {
            channel.send(Helper.boxFormat("SUMMONER: " + hit[0] + " IS NOW IN GAME\nPLACE BETS NOW!"));
        }
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = {
    statUpdater,
    gameGrabber
};