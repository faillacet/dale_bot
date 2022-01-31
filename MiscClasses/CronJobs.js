const cron = require('cron');
const DBConnector = require('../DBOps/DBConnector.js')

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
// let checkForGames = new cron.CronJob('00 0/5 * * * *', () => {
    
// });

module.exports = {
    statUpdater,
    gameGrabber
};