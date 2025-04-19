import { DelistedCoin } from '../models/DelistedCoin.js';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const BINANCE_ANNOUNCEMENTS_URL =
  'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&pageNo=1&pageSize=20';

export default async function fetchDelistingAnnouncements(bot) {
  try {
    const response = await axios.get(BINANCE_ANNOUNCEMENTS_URL);
    const delistingCatalog = response.data?.data?.catalogs.find(
      catalog => catalog.catalogName === 'Delisting'
    );
    if (!delistingCatalog?.articles) {
      console.log('No delisting catalog found.');
      return;
    } 
    console.log('Delisting catalog found:', delistingCatalog);
    
    const delistingArticles = delistingCatalog.articles.filter(article =>
      /delist/i.test(article.title)
    );

    for (const article of delistingArticles) {
      const { title, releaseDate, code, content, type } = article;
      const tickers = title.match(/[A-Z]{2,10}/g) || [];

      for (const currency of tickers) {
        const pair = `${currency}USDT`;

        // Перевіряємо, чи вже є така новина для цієї монети й біржі
        const exists = await DelistedCoin.findOne({
          currency,
          exchange: 'Binance',
          title,
        });

        if (exists) continue;

        await DelistedCoin.create({
          title,
          currency,
          pair,
          url: `https://www.binance.com/en/support/announcement/${code}`, // створюємо посилання
          exchange: 'Binance',
          dateDetected: new Date(releaseDate),
          description: content || '',
          name: currency,
        });

        console.log(`✅ Збережено новину для монети ${currency}`);
        const message = 
        `🟡 <b>BINANCE</b> 🚨\n\n` +
        `🚨 <b>DELISTING ALERT</b> 🚨\n\n` +
        `💣 <b>${currency}</b>\n` +
        `📉 <b>Пара:</b> <code>${pair}</code>\n` +
        `🕒 <b>Дата:</b> ${new Date().toLocaleString('uk-UA')}\n\n` +
        `📌 <b>Опис:</b>\n${title?.slice(0, 300)}...\n\n` +
        `🔗 <a href="https://www.binance.com/en/support/announcement/${code}">Перейти до оголошення</a>`;
      
        
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
                            callback_data: `short:${currency}:binance`
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
  } catch (error) {
    console.error('❌ Error fetching Binance announcements:', error.message);
  }
}

