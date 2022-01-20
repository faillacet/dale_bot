APIKEY = 'RGAPI-6982827c-3d27-4667-b0f0-e8f1a60d85af';

let LeagueAPI = require('leagueapiwrapper');
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);

// Imported Classes
Summoner = require('./Summoner.js')

// Table to stores previous summoners will be implemented as a backend
let summonerArray = []

// Functions
async function createNewSummoner(sumName) {
    const obj = await LeagueAPI.getSummonerByName(sumName);
    const rank = await LeagueAPI.getLeagueRanking(obj);
    let sum = new Summoner(obj.name, obj.id, obj.summonerLevel, rank[0].tier,
        rank[0].rank, rank[0].wins, rank[0].losses, rank[0].hotStreak, Date.now());
    summonerArray.push(sum);
    return sum;
}

// Not used yet
async function getChampMastery(sumName, champID) {
    const sumObj = await LeagueAPI.getSummonerByName(sumName);
    const champInfo = await LeagueAPI.getChampionMasteryByChampion(sumObj.id, champID)    
    console.log(champInfo.championPoints);
}

// Functions used directly by the Bot ---------
async function getSummonerStats(name) {
    let hit = false;
    let sumObj;
    summonerArray.forEach(summoner => {
        if (name === summoner.name) {
            sumObj = summoner;
            hit = true;
        }
    })
    if (!hit) {
        let sumObj = await createNewSummoner(name);
        return sumObj;
    }
    else {
        return sumObj;
    }
}

// TODO
async function getLeaderboard() {
    let leaderboard = [];

    // Used to sort leaderboard
    let diamond = [];
    let platinum = [];
    let gold = [];
    let silver = [];
    let bronze = [];
    let iron = [];
    
    storedSummoners.forEach(summoner => {
        //if (summoner.rank === '')
        leaderboard.push(summoner);
    })

}
// --------------------------------------------

// Make sure to include these ^
module.exports = { getSummonerStats, getLeaderboard };