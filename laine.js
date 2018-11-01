const axios = require('axios');

const baseURL = 'https://statsapi.web.nhl.com/api/v1';

module.exports = bot => {
  bot.onText(/\/lastgoal/, msg => {
    axios.get(`${baseURL}/people/8479339/stats?stats=gameLog&season=20182019`)
      .then(res => {
        const games = res.data.stats[0].splits;

        for (let i = 0; i < games.length; i++) {
          if (games[i].stat.goals) {
            const goals = games[i].stat.goals;
            const date = new Date(games[i].date).toDateString();
            const resp = `Laine scored ${goals} ${goals === 1 ? 'goal' : 'goals'} in a game against ${games[i].opponent.name} on ${date}.`;
            bot.sendMessage(msg.chat.id, resp);
            return;
          }
        }
      })
      .catch(err => console.log(err));
  })
}
