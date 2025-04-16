import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './db.js';
import TelegramBot from 'node-telegram-bot-api';
import statusCommand from './commands/status.js';
import priceCommand from './commands/price.js';
import balanceCommand from './commands/balance.js';
import tradeSpot from './commands/tradeSpot.js';
import tradeFeatures from './commands/tradeFeatures.js';
import binanceNewsMonitor from './logic/binanceNewsMonitor.js';
import tradeCallbacks from './callbacks/tradeCallbacks.js';
import fetchBybitNews from './logic/bybitNewsMonitor.js';

// Підключення до MongoDB
await connectDB();

// Запуск бота
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

const mainMenu = {
  reply_markup: {
    keyboard: [
      ['💼 Balance'],
      ['📊 Status', '💰 Price'],
      ['💼 Futures'],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

// Показати меню при /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '👋 Вітаю! Обери команду з меню нижче 👇', mainMenu);
});

// Підключення команд
binanceNewsMonitor(bot);
statusCommand(bot);
priceCommand(bot);
balanceCommand(bot);
tradeSpot(bot);
tradeFeatures(bot);
tradeCallbacks(bot);
fetchBybitNews()

// Запуск моніторингу новин від Bybit кожні 10 хвилин
setInterval(fetchBybitNews, 1 * 60 * 1000); // 10 хвилин

bot.setMyCommands([
  { command: '/start', description: 'Запустити бота' },
  { command: '/buy', description: 'Купити монету' },
  { command: '/sell', description: 'Продати монету' },
]);

export default bot;
