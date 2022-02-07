const cron = require('cron');
const DBConnector = require('../DBOps/DBConnector.js');
const Betting = require("../DBOps/BettingHandler.js");

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

// Runs every 3 minutes
let runBetting = new cron.CronJob('00 0/2 * * * *', () => {
    Betting.getActiveGames();
});

module.exports = {
    statUpdater,
    gameGrabber,
    runBetting
};