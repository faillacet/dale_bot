class Summoner {
  constructor(sumId, accountId, puuid, name, profileIconId, summonerLevel, tier, rank, leaguePoints, wins, losses) {
    // From Account obj
    this.sumId = sumId;
    this.accountId = accountId;
    this.puuid = puuid;
    this.name = name;
    this.profileIconId = profileIconId;
    this.summonerLevel = summonerLevel;
    // From Rank obj
    this.tier = tier;
    this.sumRank = rank;
    this.leaguePoints = leaguePoints;
    this.wins = wins;
    this.losses = losses;
    this.winrate = this.calcWR(wins, losses);
    this.lastUpdated = Date.now();
    this.rankIndex = this.calcRankIndex(tier, rank, leaguePoints);
  }

  calcWR(wins, losses) {
    let num = (wins / (wins + losses)) * 100;
    return (Math.round(num * 100) / 100).toFixed(2);
  }

  calcRankIndex(tier, rank, leaguePoints) {
    let sum = 0;

    sum += leaguePoints;

    // Points for Tier
    if (tier === 'IRON') sum += 0;
    else if (tier === 'BRONZE') sum += 505;
    else if (tier === 'SILVER') sum += 1010;
    else if (tier === 'GOLD') sum += 1515;
    else if (tier === 'PLATINUM') sum += 2020;
    else if (tier === 'DIAMOND') sum += 2525;

    // Points for Rank
    if (rank === 'IV') sum += 101;
    else if (rank === 'III') sum += 202;
    else if (rank === 'II') sum += 303;
    else if (rank === 'I') sum += 404;

    return sum;
  }
}

module.exports = Summoner;