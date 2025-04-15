import dotenv from 'dotenv';
dotenv.config();

import TelegramBot from 'node-telegram-bot-api';

const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;
const BOT_TOKEN = process.env.TELEGRAM_TOKEN;

if (!BOT_TOKEN || !ADMIN_ID) {
  console.error('❌ BOT_TOKEN або ADMIN_TELEGRAM_ID не задано в .env');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const testTitle = 'Binance Will List TestCoin (TST)';
const testUrl = 'https://www.binance.com/en/support/announcement/example-news';
const symbol = 'TST';

bot.sendMessage(ADMIN_ID, `🆕 Binance Listing Detected!\n\n📰 *${testTitle}*\n\n🔗 ${testUrl}`, {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [[
      { text: '✅ Купити', callback_data: `confirm_buy_${symbol}_100` },
      { text: '❌ Відхилити', callback_data: `cancel_buy_${symbol}` },
    ]]
  }
}).then(() => {
  console.log('✅ Тестове повідомлення надіслано');
  process.exit(0);
}).catch(err => {
  console.error('❌ Помилка надсилання повідомлення:', err.message);
  process.exit(1);
});
