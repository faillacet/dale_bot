APIKEY = 'RGAPI-ad9bad6c-b950-44c0-9cc0-841afd001c74';

let LeagueAPI = require('leagueapiwrapper');
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);

const fs = require('fs')

// Store all Champ IDs
const vexChampID = 711;

// Summoner object Example
const genericSummoner = {
    name: 'Jungle Weeb',
    id: 'QQdksGfjT9v2jED8xZjjbl7GnQG-YLaVL9AOSXKeLcEIXQ19',
    summonerLevel: 0, 
    tier: 'Gold', 
    rank: 'II',
    wins: '19',
    losses: '24',
    hotStreak: false,
    lastupdated: Date.now()
};

// Hash table key = summoner name and value = ID
let summonerArray = []
let leaderboard = []

// Push Summoner Name + ID to  
// TODO - add new summoner to list (db)
async function createNewSummoner(sumName) {
    const obj = await LeagueAPI.getSummonerByName(sumName);
    const rank = await LeagueAPI.getLeagueRanking(obj);
    let sum = {
        name: obj.name, id: obj.id, summonerLevel: obj.summonerLevel, tier: rank[0].tier, 
        rank: rank[0].rank, wins: rank[0].wins, losses: rank[0].losses, hotStreak: rank[0].hotStreak,
        lastUpdated: Date.now()
    };
    summonerArray.push(sum);
    return sum;
}

async function getChampMastery(sumName, champID) {
    const sumObj = await LeagueAPI.getSummonerByName(sumName);
    const champInfo = await LeagueAPI.getChampionMasteryByChampion(sumObj.id, champID)    
    console.log(champInfo.championPoints);
}

// TODO -------------------------------------------------
function updateLeaderboard() {
    // clear leaderboard then copy all to it
    leaderboard = []
    for (let i = 0; i < summonerArray.length; i++) {
        leaderboard.push(summonerArray[i]);
    }
    // sort the array by rank

}
// TODO ------------------------------------------

async function getSummonerStats(name) {
    let sumObj;
    let hit = -1;
    for (let i = 0; i < summonerArray.length; i++) {
        if (name === summonerArray[i].name) {
            sumObj = summonerArray[i];
            index = i;
            break
        }
    }
  
    if (index != -1) {
        let sumObj = await createNewSummoner(name);
        return sumObj;
    }
    else {
        //let sumObj = await updateSummoner
        return sumObj;
    }
}

module.exports = { getSummonerStats, updateLeaderboard };