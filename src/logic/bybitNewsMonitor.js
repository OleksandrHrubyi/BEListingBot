import { DelistedCoin } from '../models/DelistedCoin.js';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();
import bot from '../index.js';

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

    const items = data?.result?.hits || [];
 
    // Обробляємо новини про делістинг
    for (const item of items) {
      const { url, title, description } = item;

      if (!description) {
        console.warn(`Новина без контенту: ${title}`);
        continue; // Пропускаємо цю новину
      }

      const currency = await extractCoinSymbolFromTitle(title);
      const name = await extractCoinNameFromContent(description);

      setTimeout(() => {
        console.log(`Обробка новини: ${title}`);
      }
      , 1000);

      if (!currency) {
        console.warn(`Символ монети не знайдено для новини: ${title}`);
        continue; // Пропускаємо цю новину
      }



      const existingCoin = await DelistedCoin.findOne({ currency });
      if (!existingCoin) {
        await DelistedCoin.create({
          title,
          currency,
          pair: currency + "USDT",
          url: `https://announcements.bybit.com/en/${url}`,
          exchange: "Bybit",
          dateDetected: new Date(),
          description,
          name,
        });

        const message = 
        `🚨 <b>DELISTING ALERT</b> 🚨\n\n` +
        `💣 <b>${currency}</b>\n` +
        `📉 <b>Пара:</b> <code>${currency}USDT</code>\n` +
        `🕒 <b>Дата:</b> ${new Date().toLocaleString('uk-UA')}\n\n` +
        `📌 <b>Опис:</b>\n${description.slice(0, 300)}...\n\n` +
        `🔗 <a href="https://announcements.bybit.com/en/${url}">Перейти до оголошення</a>`;

      // Надіслати всім адмінам або певному чату (msg.chat.id)
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (chatId) {
        try {
          await bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🔻 Відкрити шорт',
                    callback_data: `short:${currency}`
                  }
                ]
              ],
            },
          });
          console.log(`Повідомлення надіслано в чат ${chatId}`);
        } catch (err) {
          console.error(`Помилка при надсиланні повідомлення в чат ${chatId}:`, err.message);
        }
      } else {
        console.error("chatId не визначено. Повідомлення не буде надіслано.");
      }
      }
    }

    console.log("Новини про делістинг оброблені та збережені.");
  } catch (err) {
    console.error("Помилка при запиті API Bybit:", err.message);
  }
}

async function  extractCoinSymbolFromTitle(title) {
  if (!title) {
    return null;
  }
  const match = title.match(/\b[A-Za-z]+(?=USDT\b|[ -]USDT\b)/i);
  return match ? match[0] : null;
}

async function extractCoinNameFromContent(content) {
  if (!content) {
    return "Unknown"; // Повертаємо значення за замовчуванням, якщо content відсутній
  }
  return content.split(" ")[0]; // Це просто приклад
}
