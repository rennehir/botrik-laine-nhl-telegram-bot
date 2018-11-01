require('dotenv').config();
const Bot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new Bot(token, {
    username: process.env.BOT_USERNAME,
    polling: true
});

console.log('bot server started...');

require('./laine')(bot);
