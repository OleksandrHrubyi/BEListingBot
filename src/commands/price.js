import exchange from "../exchange/spot.js";
import coins from "../constants/curensies.js";
import checkAccess from "../utils/checkAccess.js";

export default function priceCommand(bot) {
  // /price без аргументів — показує кнопки
  bot.onText(/\Price$/, (msg) => {
    const chatId = msg.chat.id;
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(
        msg.chat.id,
        "🚫 Цей бот тільки для особистого користування ."
      );
    }

    const options = {
      reply_markup: {
        inline_keyboard: [
          coins.map((coin) => ({
            text: coin,
            callback_data: `price_${coin}/USDT`,
          })),
        ],
      },
    };

    bot.sendMessage(chatId, "🔸 Обери монету:", options);
  });

  // Обробка натискання на кнопку
  bot.on("callback_query", async (callbackQuery) => {
    if (!checkAccess(callbackQuery.from.id)) {
      return bot.answerCallbackQuery(callbackQuery.id, {
        text: '🚫 Цей бот приватний.',
        show_alert: true,
      });
    }
  
    const msg = callbackQuery.message;
    const data = callbackQuery.data;

    if (data.startsWith("price_")) {
      const symbol = data.replace("price_", "");
      try {
        const ticker = await exchange.fetchTicker(symbol);
        const price = ticker.last;

        bot.sendMessage(
          msg.chat.id,
          `💰 Поточна ціна ${symbol}: ${price} USDT`
        );
      } catch (err) {
        console.error(err);
        bot.sendMessage(
          msg.chat.id,
          `❌ Не вдалося отримати ціну для ${symbol}.`
        );
      }
    }

    // Обов'язково відповідаємо на callback, щоб кнопка не "зависала"
    bot.answerCallbackQuery(callbackQuery.id);
  });

  // Якщо користувач напише /price BTC/USDT вручну
  bot.onText(/💰 Ціна/, (msg) => {
    const chatId = msg.chat.id;
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, '🚫 Цей бот тільки для особистого користування.');
    }
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "BTC/USDT", callback_data: "price_BTC/USDT" },
            { text: "ETH/USDT", callback_data: "price_ETH/USDT" },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, "🔸 Обери монету:", options);
  });
}
