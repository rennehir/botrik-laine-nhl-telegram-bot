const axios = require('axios');

const baseURL = 'https://statsapi.web.nhl.com';
const JetsID = 52;
const PatrikID = 8479339;

module.exports = bot => {
  bot.onText(/\/lastgoal/, async msg => {
    const chatId = msg.chat.id;

    const schedule = await axios.get(`${baseURL}/api/v1/schedule`);
    const games = schedule.data.dates[0].games;

    for (let i = 0; i < games.length; i++) {
      const teams = games[i].teams;
      if (teams.away.team.id === JetsID || teams.home.team.id === JetsID) {
        console.log('Getting score on live feed!');
        const liveGameResponse = await getLiveGameGoals(games[i].link);
        if (liveGameResponse.goals > 0) {
          bot.sendMessage(chatId, toResponseString(liveGameResponse.goals, liveGameResponse.opponentName, liveGameResponse.date));
          return;
        }
        console.log('No goal today...');
      }
    }

    console.log('Getting score from the people API');
    axios.get(`${baseURL}/api/v1/people/${PatrikID}/stats?stats=gameLog&season=20182019`)
      .then(res => {
        const games = res.data.stats[0].splits;

        for (let i = 0; i < games.length; i++) {
          if (games[i].stat.goals) {
            const goals = games[i].stat.goals;
            const opponentName = games[i].opponent.name;
            const date = new Date(games[i].date).toDateString();
            const resp = toResponseString(goals, opponentName, date);
            bot.sendMessage(chatId, resp);
            return;
          }
        }
      })
      .catch(err => console.log(err));
  })
}

const getLiveGameGoals = async link => {
  const feed = await axios.get(baseURL + link);
  const teams = feed.data.liveData.boxscore.teams;
  let goals = 0;
  let opponentName = '';
  let date = '';

  if (teams.away.team.id === JetsID) {
    const players = teams.away.players;
    Object.keys(players).forEach(playerId => {
      if (playerId === `ID${PatrikID}`) {
        goals = players[playerId].stats.skaterStats.goals;
        opponentName = teams.home.team.name;
        date = new Date(feed.data.gameData.datetime.dateTime).toDateString();
      }
    })
  } else if (teams.home.team.id === JetsID) {
    const players = teams.home.players;
    Object.keys(players).forEach(playerId => {
      if (playerId === `ID${PatrikID}`) {
        goals = players[playerId].stats.skaterStats.goals;
        opponentName = teams.away.team.name;
        date = new Date(feed.data.gameData.datetime.dateTime).toDateString();
      }
    })
  }

  return new Promise(resolve => {
    resolve({ goals, opponentName, date });
  })
}

const toResponseString = (goals, opponentName, date) => {
  return `Laine scored ${goals} ${goals === 1 ? 'goal' : 'goals'} in a game against ${opponentName} on ${date}.`
}
