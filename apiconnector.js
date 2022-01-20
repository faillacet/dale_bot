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
    hotStreak: false
};

// Hash table key = summoner name and value = ID
let summonerArray = []

// Push Summoner Name + ID to  
// TODO - add new summoner to list (db)

async function printSummoner(sumName) {
    const sumObj = await LeagueAPI.getSummonerByName(sumName);
    console.log(sumObj);
}

async function createNewSummoner(sumName) {
    const obj = await LeagueAPI.getSummonerByName(sumName);
    const rank = await LeagueAPI.getLeagueRanking(obj);
    let sum = {name: obj.name, id: obj.id, summonerLevel: obj.summonerLevel, tier: rank[0].tier, 
        rank: rank[0].rank, wins: rank[0].wins, losses: rank[0].losses, hotStreak: rank[0].hotStreak};
    summonerArray.push(sum);
    return sum;
}

async function getChampMastery(sumName, champID) {
    const sumObj = await LeagueAPI.getSummonerByName(sumName);
    const champInfo = await LeagueAPI.getChampionMasteryByChampion(sumObj.id, champID)    
    console.log(champInfo.championPoints);
}

// TODO -------------------------------------------------
async function getRankLeaderBoard() {
    storedSummoners.forEach(summoner => {
        //leaderboard.push(summoner)
    })
}

async function printRankLeaderBoard() {

}
// TODO ------------------------------------------

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

module.exports = { getSummonerStats };