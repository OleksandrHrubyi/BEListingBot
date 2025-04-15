import exchange from '../exchange/spot.js';
import coins from '../constants/curensies.js';
import amounts from '../constants/amounts.js';
import checkAccess from '../utils/checkAccess.js';


export default function tradeCommand(bot) {
  // ==== BUY ====
  bot.onText(/\/buy/, (msg) => {
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, '🚫 Цей бот тільки для особистого користування.');
    }
    bot.sendMessage(msg.chat.id, '🪙 Вибери монету для купівлі:', {
      reply_markup: {
        inline_keyboard: coins.map(coin => [
          { text: coin, callback_data: `buy_coin_${coin}` },
        ]),
      },
    });
  });

  // ==== SELL ====
  bot.onText(/\/sell/, (msg) => {
    if (!checkAccess(msg.from.id)) {
      return bot.sendMessage(msg.chat.id, '🚫 Цей бот тільки для особистого користування.');
    }
    bot.sendMessage(msg.chat.id, '💰 Вибери монету для продажу:', {
      reply_markup: {
        inline_keyboard: coins.map(coin => [
          { text: coin, callback_data: `sell_coin_${coin}` },
        ]),
      },
    });
  });

  // ==== CALLBACK ====
  bot.on('callback_query', async (query) => {
    if (!checkAccess(query.from.id)) {
      return bot.answerCallbackQuery(query.id, {
        text: '🚫 Цей бот приватний.',
        show_alert: true,
      });
    }
    const chatId = query.message.chat.id;
    const data = query.data;

    // === BUY монета ===
    if (data.startsWith('buy_coin_')) {
      const coin = data.replace('buy_coin_', '');
      let usdtBalance = 0;

      try {
        const balance = await exchange.fetchBalance();
        usdtBalance = balance.total.USDT || 0;
        usdtBalance = usdtBalance * 0.998; // з урахуванням комісії
      } catch (err) {
        console.error('Помилка при отриманні балансу:', err);
      }

      const buttons = amounts.map(amount => {
        const label = amount === 'ALL' ? `💸 Усі (${usdtBalance.toFixed(2)} USDT)` : `${amount} USDT`;
        const value = amount === 'ALL' ? usdtBalance : amount;
        return [
          { text: label, callback_data: `buy_final_${coin}_${value}` },
        ];
      });

      await bot.sendMessage(chatId, `💵 Вибери суму для покупки ${coin}:\n💰 Баланс: ${(usdtBalance / 0.998).toFixed(2)} USDT`, {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });

      await bot.answerCallbackQuery(query.id);
    }

    // === SELL монета ===
    if (data.startsWith('sell_coin_')) {
      const coin = data.replace('sell_coin_', '');
      let coinBalance = 0;

      try {
        const balance = await exchange.fetchBalance();
        coinBalance = balance.total[coin] || 0;
      } catch (err) {
        console.error('Помилка при отриманні балансу:', err);
      }

      const buttons = amounts.map(amount => {
        const label = amount === 'ALL' ? `💸 Усі (${coinBalance.toFixed(6)} ${coin})` : `${amount} USDT`;
        const value = amount === 'ALL' ? 'ALL' : amount;
        return [
          { text: label, callback_data: `sell_final_${coin}_${value}` },
        ];
      });

      await bot.sendMessage(chatId, `📤 Вибери суму продажу ${coin}:\n📦 Баланс: ${coinBalance.toFixed(6)} ${coin}`, {
        reply_markup: {
          inline_keyboard: buttons,
        },
      });

      await bot.answerCallbackQuery(query.id);
    }

    // === BUY завершення ===
    if (data.startsWith('buy_final_')) {
      const payload = data.replace('buy_final_', '');
      const [coin, amountStr] = payload.split('_');
      const amount = parseFloat(amountStr);
      const symbol = `${coin}/USDT`;

      try {
        const ticker = await exchange.fetchTicker(symbol);
        const price = ticker.last;
        const qty = (amount / price).toFixed(6);

        await exchange.createMarketBuyOrder(symbol, qty);
        await bot.sendMessage(chatId, `✅ Куплено ${qty} ${coin} на ${amount.toFixed(2)} USDT`);
      } catch (err) {
        console.error('❌ Помилка при купівлі:', err);
        await bot.sendMessage(chatId, `❌ Помилка при купівлі: ${err.message}`);
      }

      await bot.answerCallbackQuery(query.id);
    }

    // === SELL завершення ===
    if (data.startsWith('sell_final_')) {
      const payload = data.replace('sell_final_', '');
      const [coin, amountStr] = payload.split('_');
      const symbol = `${coin}/USDT`;

      try {
        let qty;

        if (amountStr === 'ALL') {
          const balance = await exchange.fetchBalance();
          qty = balance.total[coin] || 0;
        } else {
          const amount = parseFloat(amountStr);
          const ticker = await exchange.fetchTicker(symbol);
          const price = ticker.last;
          qty = (amount / price).toFixed(6);
        }

        await exchange.createMarketSellOrder(symbol, qty);
        await bot.sendMessage(chatId, `✅ Продано ${qty} ${coin}`);
      } catch (err) {
        console.error('❌ Помилка при продажу:', err);
        await bot.sendMessage(chatId, `❌ Помилка при продажу: ${err.message}`);
      }

      await bot.answerCallbackQuery(query.id);
    }
  });
}
