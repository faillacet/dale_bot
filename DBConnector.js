require("dotenv").config();
const mysql = require('mysql');
const util = require('util');
const MYSQLPASS = process.env.MYSQLPASS;
const APIKEY = process.env.APIKEY;
const Summoner = require("./Summoner.js");
let LeagueAPI = require("leagueapiwrapper");
LeagueAPI = new LeagueAPI(APIKEY, Region.NA);
const Constants = require('./Constants.js');
const { GuildTemplate } = require("discord.js");

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
  for (let i = 0; i < allSummoners.length; i++) {
    let temp = await getSummonerFromAPI(allSummoners[i].name);
    let qry = 'UPDATE summoner SET';
    let inputs = [];
    let duplicate = false;

    // Check For Differences
    if (temp.name != allSummoners[i].name) {
      qry += ' name = ?'
      duplicate = true;
      inputs.push(temp.name);
    }
    if (temp.profileIconId != allSummoners[i].profileIconId) {
      if (duplicate) {
        qry += ', profileIconId = ?';
      }
      else {
        qry += ' profileIconId = ?';
      }
      duplicate = true;
      inputs.push(temp.profileIconId);
    }
    if (temp.summonerLevel != allSummoners[i].summonerLevel) {
      if (duplicate) {
        qry += ', summonerLevel = ?';
      }
      else {
        qry += ' summonerLevel = ?';
      }
      duplicate = true;
      inputs.push(temp.summonerLevel);
    }
    if (temp.tier != allSummoners[i].tier) {
      if (duplicate) {
        qry += ', tier = ?';
      }
      else {
        qry += ' tier = ?';
      }
      duplicate = true;
      inputs.push(temp.tier);
    }
    if (temp.sumRank != allSummoners[i].sumRank) {
      if (duplicate) {
        qry += ', sumRank = ?';
      }
      else {
        qry += ' sumRank = ?';
      }
      duplicate = true;
      inputs.push(temp.sumRank);
    }
    if (temp.leaguePoints != allSummoners[i].leaguePoints) {
      if (duplicate) {
        qry += ', leaguePoints = ?';
      }
      else {
        qry += ' leaguePoints = ?';
      }
      duplicate = true;
      inputs.push(temp.leaguePoints);
    }
    if (temp.wins != allSummoners[i].wins) {
      if (duplicate) {
        qry += ', wins = ?';
      }
      else {
        qry += ' wins = ?';
      }
      duplicate = true;
      inputs.push(temp.wins);
    }
    if (temp.losses != allSummoners[i].losses) {
      if (duplicate) {
        qry += ', losses = ?';
      }
      else {
        qry += ' losses = ?';
      }
      duplicate = true;
      inputs.push(temp.losses);
    }
    if (temp.winrate != allSummoners[i].winrate) {
      if (duplicate) {
        qry += ', winrate = ?';
      }
      else {
        qry += ' winrate = ?';
      }
      duplicate = true;
      inputs.push(temp.winrate);
    }
    if (temp.lastUpdated != allSummoners[i].lastUpdated) {
      if (duplicate) {
        qry += ', lastUpdated = ?';
      }
      else {
        qry += ' lastUpdated = ?';
      }
      duplicate = true;
      inputs.push(temp.lastUpdated);
    }
    if (temp.rankIndex != allSummoners[i].rankIndex) {
      if (duplicate) {
        qry += ', rankIndex = ?';
      }
      else {
        qry += ' rankIndex = ?';
      }
      duplicate = true;
      inputs.push(temp.rankIndex);
    }
    
    // Push Changes To DB
    qry += ' WHERE puuid = ?'
    inputs.push(temp.puuid);
    await queryDB(qry, inputs);
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
  // Get Puuid
  const puuid = (await queryDB('SELECT puuid FROM summoner WHERE name = ?', name))[0].puuid;
  // Get Last 20 Games
  const matchIdList = await getMatchHistory(name);
  // Pull Data For Each game Then Push it To DB if doesnt already exist
  for (let i = 0; i < matchIdList.length; i++) {
    const temp = await getMatchData(matchIdList[i]);
    // If Ranked Game AND game not already in dB push it to DB (only player not others)
    if (temp.info.queueId === Constants.QUEUETYPE.rankedSolo && (await queryDB('SELECT COUNT(*) FROM rankedmatch WHERE gameID = ?', temp.info.gameId))[0]['COUNT(*)'] === 0) {
      for (let j = 0; j < temp.info.participants.length; j++) {
        if (puuid === temp.info.participants[j].puuid) {
          const p = temp.info.participants[j];
          await queryDB('INSERT INTO rankedmatch VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [temp.info.gameId, temp.info.gameDuration, p.assists, p.baronKills, p.bountyLevel, p.champLevel, p.championId, p.damageDealtToBuildings, p.damageDealtToObjectives, p.damageDealtToTurrets, 
          p.damageSelfMitigated, p.deaths, p.detectorWardsPlaced, p.doubleKills, p.dragonKills, p.firstBloodAssist, p.firstBloodKill, p.firstTowerAssist, p.firstTowerKill, p.gameEndedInEarlySurrender, 
          p.gameEndedInSurrender, p.goldEarned, p.goldSpent, p.individualPosition, p.inhibitorKills, p.inhibitorTakedowns, p.inhibitorsLost, p.killingSprees, p.kills, p.lane, p.largestKillingSpree, 
          p.largestMultiKill, p.magicDamageDealt, p.magicDamageDealtToChampions, p.magicDamageTaken, p.neutralMinionsKilled, p.objectivesStolen, p.objectivesStolenAssists, p.pentaKills, 
          p.physicalDamageDealt, p.physicalDamageDealtToChampions, p.physicalDamageTaken, p.puuid, p.quadraKills, p.role, p.sightWardsBoughtInGame, p.teamEarlySurrendered, p.timeCCingOthers, p.timePlayed, 
          p.totalDamageDealt, p.totalDamageDealtToChampions, p.totalDamageShieldedOnTeammates, p.totalDamageTaken, p. totalHeal, p.totalHealsOnTeammates, p.totalMinionsKilled, p.totalTimeCCDealt, 
          p.totalTimeSpentDead, p.totalUnitsHealed, p.tripleKills, p.trueDamageDealt, p.trueDamageDealtToChampions, p.trueDamageTaken, p.turretKills, p.turretTakedowns, p.turretsLost, p.visionScore, 
          p.wardsKilled, p.wardsPlaced, p.win]);
        }
      }
    }
  }
}

//pushRankedGames('Jungle Weeb');
