import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

export default function delistingsMonitor(bot) {
  let lastSeenTitle = "";

  async function checkForDelistingNews() {
    try {
      const response = await axios.get('https://www.binance.com/bapi/composite/v1/public/cms/article/list/query', {
        params: {
          pageSize: 1,
          pageNo: 1,
          type: '1',
          catalogId: '50', // News category (can adjust)
        },
      });

      const article = response.data?.data?.articles?.[0];
      if (!article) return;

      const { title, url, releaseDate } = article;

      const isDelisting =
        /delist|monitoring tag|monitor|vote/i.test(title);

      if (isDelisting && title !== lastSeenTitle) {
        lastSeenTitle = title;

        const symbol = extractSymbol(title) || "UNKNOWN";

        await bot.sendMessage(ADMIN_ID, `⚠️ *Binance Delisting News!*\n\n📰 ${title}\n\n🔗 ${url}`, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔻 Шортити", callback_data: `delist_short_${symbol}` }
              ]
            ]
          }
        });
      }

    } catch (error) {
      console.error("❌ Delisting monitor error:", error.message);
    }
  }

  function extractSymbol(title) {
    const match = title.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
  }

  setInterval(checkForDelistingNews, 60000); // раз на хвилину
}
