export default function tradeCallbacks(bot) {
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith("cmc_confirm_buy_")) {
      const [_, symbol, usdt] = data.split("_"); // cmc_confirm_buy_BLABLA_100
      await bot.sendMessage(
        chatId,
        `✅ Підтверджено купівлю ${symbol} на ${usdt} USDT`
      );

      // Тут викликаємо автоBuy функцію (import з autoBuyHandler)
      const { autoBuy } = await import("../logic/autoBuyHandler.js");
      autoBuy(symbol, usdt, bot, chatId);
    }

    if (data.startsWith("cmc_cancel_buy_")) {
      const symbol = data.split("_")[3];
      await bot.sendMessage(chatId, `❌ Покупку ${symbol} скасовано`);
    }

    if (data.startsWith("short:")) {
      const currency = data.split(":")[1];

      await bot.sendMessage(
        chatId,
        `🔻 Вибери суму для шорту на <b>${currency}</b>:`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "50 USDT",
                  callback_data: `short_amount:${currency}:50`,
                },
                {
                  text: "100 USDT",
                  callback_data: `short_amount:${currency}:100`,
                },
              ],
              [
                {
                  text: "500 USDT",
                  callback_data: `short_amount:${currency}:500`,
                },
                {
                  text: "1000 USDT",
                  callback_data: `short_amount:${currency}:1000`,
                },
              ],
            ],
          },
        }
      );
    }

    // Обробка вибору суми та показ плеча
    else if (data.startsWith("short_amount:")) {
      const [_, currency, amount] = data.split(":");

      await bot.sendMessage(
        chatId,
        `⚙️ Вибери плече для <b>${currency}</b> на <b>${amount} USDT</b>:`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "3x",
                  callback_data: `short_confirm:${currency}:${amount}:3`,
                },
                {
                  text: "5x",
                  callback_data: `short_confirm:${currency}:${amount}:5`,
                },
              ],
              [
                {
                  text: "10x",
                  callback_data: `short_confirm:${currency}:${amount}:10`,
                },
                {
                  text: "20x",
                  callback_data: `short_confirm:${currency}:${amount}:20`,
                },
              ],
            ],
          },
        }
      );
    }

    // Підтвердження відкриття шорту (можна буде тут викликати API біржі)
    else if (data.startsWith("short_confirm:")) {
      const [_, currency, amount, leverage] = data.split(":");

      // Тут ти можеш зробити запит до біржі або зберегти намір у БД
      await bot.sendMessage(
        chatId,
        `
📉 <b>Шорт відкрито</b>
🪙 Монета: <b>${currency}</b>
💰 Сума: <b>${amount} USDT</b>
📈 Плече: <b>${leverage}x</b>
          `,
        { parse_mode: "HTML" }
      );
    }

    // Відповідь на callback, щоб уникнути зависання кнопок
    await bot.answerCallbackQuery(query.id);
  });
}
