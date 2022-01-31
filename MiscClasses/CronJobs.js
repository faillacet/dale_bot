const cron = require('cron');
const DBConnector = require('../DBOps/DBConnector.js');
const Helper = require("../MiscClasses/HelperFunctions.js");

let CHANNEL;

function setChannel(chan) {
    CHANNEL = chan;
}

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

// Runs every 5 minutes
let checkForGames = new cron.CronJob('00 0/5 * * * *', () => {
    checkForActiveGames();
});

let activeGames = [];
async function checkForActiveGames() {
    try {
        let hit = [];
        let sumList = await DBConnector.getAllStoredSummoners();
        for (let i = 0; i < sumList.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Summoner is in game
            if ((await DBConnector.isInGame(sumList[i].name)).gameID != 0) {
                let alreadyAlerted = false;
                // Check to see if already alerted
                for (let j = 0; j < activeGames.length; j++) {
                    if (activeGames[j] === sumList[i].name) {
                        alreadyAlerted = true;
                    }
                }
                // if havent been alerted add to alert q
                if (!alreadyAlerted) {
                    hit.push(sumList[i].name);
                }
            }
            // summoner is not in game - remove from alert q if they were in it b4
            else {
                let index = 0;
                while (index < activeGames.length) {
                    if (activeGames[index] === sumList[i].name) {
                       activeGames.splice(index, 1);
                    }
                    else {
                        ++index;
                    }
                }
            }
            
        }

        // Display To Channel If Successful Hits
        if (hit.length > 1) {
            let botMessage = "SUMMONERS: \n"
            for (let i = 0; i < hit.length; i++) {
                botMessage += hit[i] + "\n";
            }
            botMessage += "ARE NOW IN GAME\nPLACE BETS NOW!";
            CHANNEL.send(Helper.boxFormat(botMessage));
        }
        else if (hit.length === 1) {
            CHANNEL.send(Helper.boxFormat("SUMMONER: " + hit[0] + " IS NOW IN GAME\nPLACE BETS NOW!"));
        }

        // add user to active alerts q
        for (let i = 0; i < hit.length; i++) {
            activeGames.push(hit[i]);
        }
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = {
    setChannel,
    statUpdater,
    gameGrabber,
    checkForGames
};