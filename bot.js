require('dotenv').config();

const token = process.env.BOT_TOKEN;
const baseURL = 'https://statsapi.web.nhl.com';

const CronJob = require('cron').CronJob;
const axios = require('axios');
const moment = require('moment');
const Bot = require('node-telegram-bot-api');
const bot = new Bot(token, { polling: true });

console.log('bot server started...');

let cronIsRunning = false;
let job;

bot.onText(/^\/start/, function (message) {
  let name = 'Renne';

  if (!cronIsRunning) {
    /**
     * Create a cron job.
     */
    job = new CronJob('15 8 * * *', () => {
      /**
       * Runs every day of the year at 8:10.
       */

      // Get yesterday's date and format it for NHL API
      let date = moment().subtract(1, 'days').format('YYYY-MM-DD');
      
      axios.get(`${baseURL}/api/v1/schedule?date=${date}`)
        .then((response) => {
          const games = response.data.dates[0].games;
          let msg = '*Last night\'s NHL scores:*';
          games.forEach((game) => {
            msg = msg + '\n\n' + game.teams.away.team.name + ' at ' + game.teams.home.team.name + 
              '\n' + game.teams.away.score + ' - ' + game.teams.home.score;
          });
          bot.sendMessage(message.chat.id, msg, {
            parse_mode: 'markdown'
          });    
        })
        .catch(e => {
          console.log(e);
        })
      }, () => {
        /* This function is executed when the job stops */
        bot.sendMessage(chatID, 'Cronjob stopped.').then(() => {});
      },
      false, /* Start the job right now */
      'Europe/Helsinki' /* Time zone of this job. */
    );
  }

  job.start();
  cronIsRunning = true;
});

bot.onText(/^\/stop/, function (message) {
  job.stop();
});
