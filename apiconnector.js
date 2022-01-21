APIKEY = 'RGAPI-6982827c-3d27-4667-b0f0-e8f1a60d85af';

let LeagueAPI = require('leagueapiwrapper');
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);

// Imported Classes
Summoner = require('./Summoner.js')

// Table to stores previous summoners will be implemented as a backend
let summonerArray = []
let leaderboard = [];

// Functions
async function findNewSummoner(sumName) {
    const obj = await LeagueAPI.getSummonerByName(sumName);
    const rank = await LeagueAPI.getLeagueRanking(obj);
    return new Summoner(obj.name, obj.id, obj.summonerLevel, rank[0].tier,
        rank[0].rank, rank[0].wins, rank[0].losses, rank[0].hotStreak);
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

    // if summoner not in db, add to db
    if (!hit) {
        let sumObj = await findNewSummoner(name);
        summonerArray.push(sumObj);
        return sumObj;
    }
    else {
        // stats over an hour old, update them
        if (sumObj.lastUpdated < Date.now() - 3600000) {
            return updateSummoner(sumObj.name);
        } 
        else {
            return sumObj;
        }
    }
}

async function getRankLeaderboard() {
    leaderboard = [];
    summonerArray.forEach(summoner => {
        leaderboard.push(summoner);
    })

    leaderboard.sort((a, b) => b.rankIndex - a.rankIndex);

    return leaderboard;
}

async function getWRLeaderboard() {
    leaderboard = [];
    summonerArray.forEach(summoner => {
        leaderboard.push(summoner);
    })

    leaderboard.sort((a, b) => b.winrate - a.winrate);

    return leaderboard;
}

// NO BUILT IN ERROR CHECKING!
async function updateSummoners() {
    summonerArray.forEach(summoner => {
        summoner = findNewSummoner(summoner.name);
    })
}

function deleteSummoner(name) {
    for (let i = 0; i < summonerArray.length; i++) {
        if (summonerArray[i].name === name) {
            summonerArray.splice(i, 1);
            return true;
        }
    }
    return false;
}

// Make sure to include these ^
module.exports = { 
    getSummonerStats, getRankLeaderboard, getWRLeaderboard, updateSummoners, deleteSummoner 
};