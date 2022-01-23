require("dotenv").config();
const mysql = require('mysql');
const util = require('util');
const MYSQLPASS = process.env.MYSQLPASS;
const APIKEY = process.env.APIKEY;
const Summoner = require("./Summoner.js");
let LeagueAPI = require("leagueapiwrapper");
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);
const Constants = require('./Constants.js');

// Connect to DB
const connection = mysql.createConnection({
  host: '34.133.182.114',
  user: 'root',
  password: MYSQLPASS,
  database: 'league'
});

// Convert Object to Promise
const query = util.promisify(connection.query).bind(connection);

// Function Used to access DB via query and passed values
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

// Non-Exported Functions (Backend stuff) ----------------------------------------------
async function getMatchHistory(name) {
  const sumList = await queryDB('SELECT * FROM summoner WHERE name = ?', name);
  // If not in DB, enter into db then repeat
  if (sumList.length < 1) {
    await insertSumIntoDB(name);
    const sumList = await queryDB('SELECT * FROM summoner WHERE name = ?', name);
  }
  // Get Last 20 Matches from Summoner
  const matchList = await LeagueAPI.getMatchList(sumList[0].puuid);
  return matchList;
}

async function getMatchData(matchId) {
  const matchData = await LeagueAPI.getMatch(matchId);
  return matchData;
}

// OVERLOADS API LIMIT USE ONLY ON DOWN TIME
async function pushRankedGames(name) {
  // Get Last 20 Games
  let matchIdList = await getMatchHistory(name);
  // Pull Data For Each game
  let matchList = [];
  for (let i = 0; i < matchIdList.length; i++) {
    let temp = (await getMatchData(matchIdList[i])).info;
    if (temp.queueId === Constants.QUEUETYPE.rankedSolo) {
      matchList.push();
    }
  }
  console.log(matchList);

}

async function tester() {
  let x = await getMatchHistory('Jungle Weeb');
  let game = await getMatchData(x[0]);
  for (let i = 0; game.length; i++) {

  }
}

tester();
