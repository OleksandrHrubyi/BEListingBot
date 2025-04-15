import exchange from "../exchange/spot.js";
import checkAccess from "../utils/checkAccess.js";

export default function balanceCommand(bot) {
  bot.onText(/\Balance/, async (msg) => {
    const chatId = msg.chat.id;
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(
        msg.chat.id,
        "🚫 Цей бот тільки для особистого користування ."
      );
    }

    try {
      const time = await exchange.fetchTime();
      const serverTime = new Date(time).toLocaleString();
      const balance = await exchange.fetchBalance();
      console.log(balance, "balance");

      const formattedBalance = Object.entries(balance.total)
        .map(([currency, amount]) => `${currency}: ${amount}`)
        .join("\n");

      bot.sendMessage(chatId, `Баланс:\n${formattedBalance}`);
    } catch (err) {
      console.error("Bybit connection error:", err.message);
      bot.sendMessage(chatId, "❌ Не вдалося підключитися до Bybit API.");
    }
  });
}
