import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;
let lastListingDate = null;

export default function cmcListingsMonitor(bot) {
  async function checkNewListings() {
    try {
      const response = await axios.get(
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
        {
          headers: {
            "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY,
          },
          params: {
            start: 1,
            limit: 5,
            sort: "date_added",
          },
        }
      );

      
      const listings = response.data.data;
      const newest = listings[0];

      const addedDate = new Date(newest.date_added).getTime();
      if (!lastListingDate || addedDate > lastListingDate) {
        lastListingDate = addedDate;

        const symbol = newest.symbol;
        const url = `https://coinmarketcap.com/currencies/${newest.slug}`;

        bot.sendMessage(
          ADMIN_ID,
          `🚀 *CoinMarketCap Listing Detected!*\n\n🪙 *${symbol}*\n\n🔗 ${url}`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "✅ Купити",
                    callback_data: `cmc_confirm_buy_${symbol}_100`,
                  },
                  {
                    text: "❌ Відхилити",
                    callback_data: `cmc_cancel_buy_${symbol}`,
                  },
                ],
              ],
            },
          }
        );
      }
    } catch (err) {
      console.error("❌ CMC listings error:", err.message);
    }
  }

  // Запускаємо перевірку кожні 60 секунд
  setInterval(checkNewListings, 60 * 1000);
}
