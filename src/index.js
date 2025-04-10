import express, { json } from 'express';
import { schedule } from 'node-cron';
import { marketsFile, telegramToken, telegramChatId, port } from './config/index.js';
import ExchangeService from './services/exchanges.js';
import TelegramService from './services/telegram.js';
import apiRoutes from './routes/api.js';

const app = express();
const exchangeService = new ExchangeService(marketsFile);
const telegramService = new TelegramService(telegramToken, telegramChatId);

// Middleware
app.use(json());

// Routes
app.use('/api', apiRoutes(exchangeService));

// Періодична перевірка (кожні 5 хвилин)
schedule('*/5 * * * *', () => {
  console.log('Перевірка лістингів...');
  exchangeService.checkListings(telegramService);
});

// Початкова перевірка
exchangeService.checkListings(telegramService);

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});