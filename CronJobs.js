const cron = require('cron');

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

// Runs Every 5 Minutes
// let checkForActiveGame = new cron.CronJob('00 */5 * * * *', () => {

// });

module.exports = {
    statUpdater,
    gameGrabber
};