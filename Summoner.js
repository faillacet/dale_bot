class Summoner {
  constructor(name, id, summonerLevel, tier, rank, wins, losses, hotStreak) {
    this.name = name;
    this.id = id;
    this.summonerLevel = summonerLevel;
    this.tier = tier;
    this.rank = rank;
    this.wins = wins;
    this.losses = losses;
    this.winrate = this.calcWR(wins, losses);
    this.hotStreak = hotStreak;
    this.lastUpdated = Date.now();
    this.rankIndex = this.calcRankIndex(tier, rank);
  }

  calcWR(wins, losses) {
    let num = (wins / (wins + losses)) * 100;
    return (Math.round(num * 100) / 100).toFixed(2);
  }

  calcRankIndex(tier, rank) {
    let sum = 0;

    // Points for Tier
    if (tier === 'IRON') sum += 0;
    else if (tier === 'BRONZE') sum += 4;
    else if (tier === 'SILVER') sum += 8;
    else if (tier === 'GOLD') sum += 12;
    else if (tier === 'PLATINUM') sum += 16;
    else if (tier === 'DIAMOND') sum += 20;

    // Points for Rank
    if (rank === 'I') sum += 4;
    else if (rank === 'II') sum += 3;
    else if (rank === 'III') sum += 2;
    else if (rank === 'IV') sum += 1;

    return sum;
  }
}

module.exports = Summoner;