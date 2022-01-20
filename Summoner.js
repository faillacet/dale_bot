class Summoner {
  constructor(name, id, summonerLevel, tier, rank, wins, losses, hotStreak, lastUpdated) {
    this.name = name;
    this.id = id;
    this.summonerLevel = summonerLevel;
    this.tier = tier;
    this.rank = rank;
    this.wins = wins;
    this.losses = losses;
    this.winrate = this.calcWR(wins, losses);
    this.hotStreak = hotStreak;
    this.lastUpdated = lastUpdated;
  }

  calcWR(wins, losses) {
    return (wins / (wins + losses)) * 100;
  }
}

module.exports = Summoner;