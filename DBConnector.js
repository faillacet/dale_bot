require("dotenv").config();
const mysql = require('mysql');
const MYSQLPASS = process.env.MYSQLPASS;
const util = require('util');
const APIKEY = process.env.APIKEY;
const Summoner = require("./Summoner.js");
let LeagueAPI = require("leagueapiwrapper");
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);

// Connect to DB
const connection = mysql.createConnection({
  host: '34.133.182.114',
  user: 'root',
  password: MYSQLPASS,
  database: 'league'
});

// Convert Object to Promise
const query = util.promisify(connection.query).bind(connection);

// Returns results
async function queryDB(qry, values) {
  try {
    const x = await query(qry, values);
    return x;
  }
  catch (e) {
    console.log(e);
  }
}

// Helper Functions
async function getSummonerFromAPI(name) {
  const sumObj = await LeagueAPI.getSummonerByName(name);
  const rank = await LeagueAPI.getLeagueRanking(sumObj);
  let index;
  for (let i = 0; i < rank.length; i++) {
    if (rank[i].queueType === "RANKED_SOLO_5x5") {
      index = i;
      break;
    }
  }

  // Format Summoner Obj
  return new Summoner(
    sumObj.id,
    sumObj.accountId,
    sumObj.puuid,
    sumObj.name,
    sumObj.profileIconId,
    sumObj.summonerLevel,
    rank[index].tier,
    rank[index].rank,
    rank[index].leaguePoints,
    rank[index].wins,
    rank[index].losses
  );
}

async function insertSumIntoDB(name) {
  const sum = await getSummonerFromAPI(name);
  await queryDB('INSERT INTO summoner VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [sum.sumId, sum.accountId, sum.puuid, sum.name, sum.profileIconId, sum.summonerLevel, sum.tier,
    sum.sumRank, sum.leaguePoints, sum.wins, sum.losses, sum.winrate, sum.lastUpdated, sum.rankIndex]);
}

// Available Functions
async function getStats(name) {
  let result = await queryDB('SELECT * FROM summoner WHERE name = ?', [name]);
  // If found, return result
  if (result.length > 0) { 
    return result[0];
  }
  // Not found, Try to find from API
  else {
    await insertSumIntoDB(name);
    result = await queryDB('SELECT * FROM summoner WHERE name = ?', [name]);
    return result[0];
  }
}

async function getRankLeaderboard(count) {
  return await queryDB('SELECT * FROM summoner ORDER BY rankIndex DESC LIMIT ?', count);
}

async function getWRLeaderboard(count) {
  return await queryDB('SELECT * FROM summoner ORDER BY winrate DESC LIMIT ?', count);
}

async function deleteSummoner(name) {
  let exists = await queryDB('SELECT COUNT(*) FROM summoner WHERE name = ?', name);
  if (exists[0]['COUNT(*)'] > 0) {
    await queryDB('DELETE FROM summoner WHERE name = ?', name);
    return true;
  }
  else {
    return false;
  }
}

async function updateAllSummoners() {
  let allSummoners = await queryDB('SELECT * FROM summoner');
  await queryDB('DELETE FROM summoner');
  for (let i = 0; i < allSummoners.length; i++) {
    insertSumIntoDB(allSummoners[i].name);
  }
}

module.exports = {
  getStats, getRankLeaderboard, getWRLeaderboard, deleteSummoner, updateAllSummoners
};