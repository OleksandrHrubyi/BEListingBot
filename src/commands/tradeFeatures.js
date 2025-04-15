import futures from "../exchange/futures.js";
import checkAccess from "../utils/checkAccess.js";

export default function tradeFutures(bot) {
  bot.onText(/\Futures/, async (msg) => {
    const chatId = msg.chat.id;
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(
        msg.chat.id,
        "🚫 Цей бот тільки для особистого користування."
      );
    }

    try {
      // 1. Отримуємо баланс
      const balance = await futures.fetchBalance();
      const usdt = balance.total.USDT || 0;

      // 2. Отримуємо відкриті позиції
      const positions = await futures.fetchPositions();
      const activePositions = positions.filter((pos) => pos.contracts > 0);

      let text = `📊 <b>Ф’ючерсний акаунт</b>\n\n💰 <b>USDT баланс:</b> ${usdt.toFixed(
        2
      )} USDT\n`;

      if (activePositions.length > 0) {
        text += `\n🔥 <b>Активні позиції:</b>\n`;

        for (const pos of activePositions) {
          const side = pos.side.toUpperCase(); // long / short
          const symbol = pos.symbol;
          const contracts = pos.contracts;
          const entry = pos.entryPrice;
          const unrealizedPnl = pos.unrealizedPnl;

          text += `\n• ${symbol} (${side})\n`;
          text += `  - 📉 Entry: ${entry}\n`;
          text += `  - 🔢 Size: ${contracts}\n`;
          text += `  - 📈 PnL: ${unrealizedPnl.toFixed(2)} USDT\n`;
        }
      } else {
        text += `\n⛔ Немає відкритих позицій.`;
      }

      await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
    } catch (error) {
      console.error("❌ Помилка при запиті ф’ючерсних даних:", error);
      await bot.sendMessage(
        chatId,
        "❌ Не вдалося отримати інформацію по ф’ючерсам."
      );
    }
  });
}
