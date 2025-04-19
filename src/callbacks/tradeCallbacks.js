import { getCurrentPrice } from "../logic/getCurrentPrice.js";
import { getIndicatorsText } from "../logic/getIndicatorsText.js";
import autoBuy from "../logic/autoBuyHandler.js";

export default function tradeCallbacks(bot) {
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    // Покупка CMC
    if (data.startsWith("cmc_confirm_buy_")) {
      const [_, symbol, usdt] = data.split("_");
      await bot.sendMessage(
        chatId,
        `✅ Підтверджено купівлю ${symbol} на ${usdt} USDT`
      );
      autoBuy(symbol, usdt, bot, chatId);
    }

    // Скасування покупки
    if (data.startsWith("cmc_cancel_buy_")) {
      const symbol = data.split("_")[3];
      await bot.sendMessage(chatId, `❌ Покупку ${symbol} скасовано`);
    }

    // Кнопка Шорт
    if (data.startsWith("short:")) {
      const [_, currency, exchange] = data.split(":");

      // Отримуємо поточну ціну і індикатори
      let price = await getCurrentPrice(currency, exchange);
      let indicatorsText = await getIndicatorsText(currency, exchange);

      // Перевіряємо, чи ціна не "Недоступно"
      if (!price || price === "Недоступно") {
        price = "Ціна наразі недоступна";
      }

      // Якщо індикатори повертаються як об'єкт, перетворюємо їх у текст
      if (typeof indicatorsText === "object") {
        indicatorsText = JSON.stringify(indicatorsText, null, 2); // Перетворюємо об'єкт у зрозумілий формат
      }

      // Відправляємо повідомлення з інформацією про шорт
      await bot.sendMessage(
        chatId,
        `
🔻 Ви обрали шорт для <b>${currency}</b> (${exchange}):

💱 Поточна ціна: <b>${price}</b>

📊 Індикатори:
<pre>${indicatorsText}</pre>

❗ Підтвердьте дію перед вибором суми та плеча.
        `,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Підтвердити шорт",
                  callback_data: `short_confirm:${currency}:${exchange}`,
                },
                {
                  text: "Скасувати",
                  callback_data: `cancel_short:${currency}:${exchange}`,
                },
              ],
            ],
          },
        }
      );
    }

    // Підтвердження шорту
    else if (data.startsWith("short_confirm:")) {
      const [_, currency, exchange] = data.split(":");

      await bot.sendMessage(
        chatId,
        `⚙️ Виберіть суму для шорту на <b>${currency}</b> (${exchange}):`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "50 USDT",
                  callback_data: `short_amount:${currency}:${exchange}:50`,
                },
                {
                  text: "100 USDT",
                  callback_data: `short_amount:${currency}:${exchange}:100`,
                },
              ],
              [
                {
                  text: "500 USDT",
                  callback_data: `short_amount:${currency}:${exchange}:500`,
                },
                {
                  text: "1000 USDT",
                  callback_data: `short_amount:${currency}:${exchange}:1000`,
                },
              ],
            ],
          },
        }
      );
    }

    // Вибір суми для шорту
    else if (data.startsWith("short_amount:")) {
      const [_, currency, exchange, amount] = data.split(":");

      await bot.sendMessage(
        chatId,
        `⚙️ Виберіть плече для <b>${currency}</b> (${exchange}) на <b>${amount} USDT</b>:`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "3x",
                  callback_data: `short_final:${currency}:${exchange}:${amount}:3`,
                },
                {
                  text: "5x",
                  callback_data: `short_final:${currency}:${exchange}:${amount}:5`,
                },
              ],
              [
                {
                  text: "10x",
                  callback_data: `short_final:${currency}:${exchange}:${amount}:10`,
                },
                {
                  text: "20x",
                  callback_data: `short_final:${currency}:${exchange}:${amount}:20`,
                },
              ],
            ],
          },
        }
      );
    }

    // Завершення шорту
    else if (data.startsWith("short_final:")) {
      const [_, currency, exchange, amount, leverage] = data.split(":");

      // Відправляємо підтвердження відкриття шорт-позиції
      await bot.sendMessage(
        chatId,
        `
📉 <b>Шорт відкрито</b>
🪙 Монета: <b>${currency}</b>
💰 Сума: <b>${amount} USDT</b>
📈 Плече: <b>${leverage}x</b>
🏦 Біржа: <b>${exchange}</b>

🚀 Ваш шорт відкрито успішно!
        `,
        { parse_mode: "HTML" }
      );
    }

    // Скасування шорту
    else if (data.startsWith("cancel_short:")) {
      const [_, currency, exchange] = data.split(":");

      await bot.sendMessage(chatId, `❌ Шорт на <b>${currency}</b> (${exchange}) скасовано`, {
        parse_mode: "HTML",
      });
    }

    // Щоб Telegram не зависав після натискання кнопок
    await bot.answerCallbackQuery(query.id);
  });
}
