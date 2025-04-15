export default function tradeCallbacks(bot) {
    bot.on('callback_query', async (query) => {
        const chatId = query.message.chat.id;
        const data = query.data;
      
        if (data.startsWith('cmc_confirm_buy_')) {
          const [_, symbol, usdt] = data.split('_'); // cmc_confirm_buy_BLABLA_100
          await bot.sendMessage(chatId, `✅ Підтверджено купівлю ${symbol} на ${usdt} USDT`);
          
          // Тут викликаємо автоBuy функцію (import з autoBuyHandler)
          const { autoBuy } = await import('../logic/autoBuyHandler.js');
          autoBuy(symbol, usdt, bot, chatId);
        }
      
        if (data.startsWith('cmc_cancel_buy_')) {
          const symbol = data.split('_')[3];
          await bot.sendMessage(chatId, `❌ Покупку ${symbol} скасовано`);
        }
      
        await bot.answerCallbackQuery(query.id);
      });
      
}
