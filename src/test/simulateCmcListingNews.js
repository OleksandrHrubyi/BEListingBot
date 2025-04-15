import dotenv from 'dotenv';
dotenv.config();
import bot from '../index.js';

const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

function simulateCmcListing(symbol = 'PEPE', name = 'Pepe Meme Coin') {
  bot.sendMessage(ADMIN_ID, `🆕 *Новий лістинг на CoinMarketCap!*\n\n🪙 *${name} (${symbol})*\n\n🕒 Дата: ${new Date().toLocaleString()}`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Купити', callback_data: `confirm_buy_${symbol}_100` },
        { text: '❌ Відхилити', callback_data: `cancel_buy_${symbol}` },
      ]]
    }
  });
}

simulateCmcListing();
