const cron = require('cron');

let statUpdater = new cron.CronJob('00 00 * * * *', () => {
    console.log("UPDATED DB AT: " + Date.now());
    DBConnector.updateAllSummoners();
});

let gameGrabber = new cron.CronJob('00 00 03 * * *', () => {
    console.log("GRABBING MATCH HISTORY AT: " + Date.now());
    DBConnector.grabAllRankedGames();
});

//let checkForActiveGame = newcron.CronJob('00 00 * * * *')

module.exports = {
    statUpdater,
    gameGrabber
};