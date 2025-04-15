// src/test/simulateDelistingNews.js

import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
dotenv.config();

const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

// ⚠️ ВАЖЛИВО: polling: false, щоб не було конфліктів
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });

async function simulateDelistingNews() {
  const fakeNews = {
    title: 'Delist',
    url: 'https://www.binance.com/en/square/news/binance-news',
  };

  const match = fakeNews.title.match(/\(([^)]+)\)/);
  const symbol = match ? match[1] : 'UNKNOWN';

  await bot.sendMessage(
    ADMIN_ID,
    `⚠️ *Binance Delisting News!*\n\n📰 ${fakeNews.title}\n\n🔗 ${fakeNews.url}`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔻 Шортити',
              callback_data: `delist_short_${symbol}`,
            },
          ],
        ],
      },
    }
  );

  console.log('🧪 Тестове повідомлення надіслано!');
}

simulateDelistingNews();
