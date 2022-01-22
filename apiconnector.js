require("dotenv").config();
const APIKEY = process.env.APIKEY;
let LeagueAPI = require("leagueapiwrapper");
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);

// Imported Classes
Summoner = require("./Summoner.js");

// Table to stores previous summoners will be implemented as a backend
let summonerArray = [];
let leaderboard = [];

// Functions
// Not used yet
async function getChampMastery(sumName, champID) {
  const sumObj = await LeagueAPI.getSummonerByName(sumName);
  const champInfo = await LeagueAPI.getChampionMasteryByChampion(
    sumObj.id,
    champID
  );
  console.log(champInfo.championPoints);
}

// Functions used directly by the Bot ---------
async function getSummonerStats(name) {
  let hit = false;
  let sumObj;
  summonerArray.forEach((summoner) => {
    if (name === summoner.name) {
      sumObj = summoner;
      hit = true;
    }
  });

  // if summoner not in db, add to db
  if (!hit) {
    let sumObj = await findNewSummoner(name);
    summonerArray.push(sumObj);
    return sumObj;
  } else {
    // stats over an hour old, update them
    if (sumObj.lastUpdated < Date.now() - 3600000) {
      return updateSummoner(sumObj.name);
    } else {
      return sumObj;
    }
  }
}

async function getRankLeaderboard() {
  leaderboard = [];
  summonerArray.forEach((summoner) => {
    leaderboard.push(summoner);
  });

  leaderboard.sort((a, b) => b.rankIndex - a.rankIndex);

  return leaderboard;
}

async function getWRLeaderboard() {
  leaderboard = [];
  summonerArray.forEach((summoner) => {
    leaderboard.push(summoner);
  });

  leaderboard.sort((a, b) => b.winrate - a.winrate);

  return leaderboard;
}

// Utility Stuff
async function findNewSummoner(sumName) {
  const obj = await LeagueAPI.getSummonerByName(sumName);
  const rank = await LeagueAPI.getLeagueRanking(obj);
  let index;
  for (let i = 0; i < rank.length; i++) {
    if (rank[i].queueType === "RANKED_SOLO_5x5") {
      index = i;
    }
  }
  return new Summoner(
    obj.name,
    obj.id,
    obj.summonerLevel,
    rank[index].tier,
    rank[index].rank,
    rank[index].wins,
    rank[index].losses,
    rank[index].hotStreak
  );
}

async function updateSummoners() {
  for (let i = 0; i < summonerArray.length; i++) {
    let name = summonerArray[i].name;
    summonerArray[i] = await findNewSummoner(name);
  }
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
  getSummonerStats,
  getRankLeaderboard,
  getWRLeaderboard,
  updateSummoners,
  deleteSummoner,
};
