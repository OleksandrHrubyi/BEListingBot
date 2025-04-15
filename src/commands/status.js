import exchange from '../exchange/spot.js';
import checkAccess from '../utils/checkAccess.js';

export default function statusCommand(bot) {
  bot.onText(/\Status/, async (msg) => {
    const chatId = msg.chat.id;
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, '🚫 Цей бот тільки для особистого користування.');
    }

    try {
      await exchange.loadMarkets();
      const time = await exchange.fetchTime();
      const serverTime = new Date(time).toLocaleString();

      bot.sendMessage(chatId, `✅ Bybit підключено.\n🕒 Серверний час: ${serverTime}`);
    } catch (err) {
      console.error('Bybit connection error:', err.message);
      bot.sendMessage(chatId, '❌ Не вдалося підключитися до Bybit API.');
    }
  });
  }