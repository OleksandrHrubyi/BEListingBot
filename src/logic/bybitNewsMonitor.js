import { DelistedCoin } from '../models/DelistedCoin.js';
import axios from 'axios';

const API_URL =
  "https://api2.bybit.com/announcements/api/search/v1/index/announcement-posts_en";

export default async function fetchBybitNews() {
  try {
    const { data } = await axios.post(API_URL, {
      query: "",
      page: 0,
      hitsPerPage: 8,
      filters: "category.key: 'delistings'"

    });
    console.log(data?.result?.hits);

    const items = data?.result?.hits || [];

    // Обробляємо новини про делістинг
    for (const item of items) {
      const { id, title, start_date_timestamp, description } = item;

      // Перевіряємо, чи є content
      if (!description) {
        console.warn(`Новина без контенту: ${title}`);
        continue; // Пропускаємо цю новину
      }

      //const symbol = extractCoinSymbolFromTitle(title);
      const name = extractCoinNameFromContent(description);

      // Перевіряємо, чи монета вже є в базі
      const existingCoin = await DelistedCoin.findOne({ symbol: 'BTC' });
      if (!existingCoin) {
        // Якщо немає, зберігаємо монету в базі даних
        await DelistedCoin.create({
         symbol: 'BTC',
          name,
          exchange: "Bybit",
          reason: "Delisting",
          delistDate: new Date(start_date_timestamp), // дата делістингу
        });
      }
    }

    console.log("Новини про делістинг оброблені та збережені.");
  } catch (err) {
    console.error("Помилка при запиті API Bybit:", err.message);
  }
}

// Функція для витягування символу монети з заголовка новини
function extractCoinSymbolFromTitle(title) {
  cons
  // Приклад: шукаємо символ монети (3-5 літер)
  const match = title.match(/\b[A-Z]{3,5}\b/);
  return match ? match[0] : "";
}

// Функція для витягування назви монети з контенту новини
function extractCoinNameFromContent(content) {
  if (!content) {
    return "Unknown"; // Повертаємо значення за замовчуванням, якщо content відсутній
  }
  return content.split(" ")[0]; // Це просто приклад
}
