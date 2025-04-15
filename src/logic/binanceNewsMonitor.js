import axios from 'axios';

export default function binanceNewsMonitor(bot) {
  const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

  async function checkForNewListings() {
    try {
      const response = await axios.get('https://www.binance.com/bapi/composite/v1/public/cms/article/list/query', {
        params: {
          pageSize: 1,
          pageNo: 1,
          type: '1',
          catalogId: '48', // Listing info
        },
      });

    
      const article = response.data?.data?.articles?.[0];
      if (!article) return;

      const { title, releaseDate, url } = article;
      const date = new Date(releaseDate);

      const isRecent = Date.now() - date.getTime() < 3 * 60 * 1000; // 3 хв
      if (isRecent && title.includes('Will List')) {
        bot.sendMessage(ADMIN_ID, `🆕 Binance Listing Detected!\n\n📰 *${title}*\n\n🔗 ${url}`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '✅ Купити', callback_data: `confirm_buy_${extractSymbol(title)}_100` },
              { text: '❌ Відхилити', callback_data: `cancel_buy_${extractSymbol(title)}` },
            ]]
          }
        });
      }

    } catch (err) {
      console.error('❌ Binance news fetch error:', err.message);
    }
  }

  function extractSymbol(title) {
    const match = title.match(/\(([^)]+)\)/);
    return match ? match[1] : 'UNKNOWN';
  }

  // Перевірка раз на 30 сек
  setInterval(checkForNewListings, 30000);
}
