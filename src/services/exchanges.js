import ccxt from 'ccxt';
import { readJsonFile, writeJsonFile } from '../utils/file.js';
import { formatDateTime, getBaseToken } from '../utils/helpers.js';


class ExchangeService {
  constructor(marketsFile) {
    this.exchanges = {
      binance: new ccxt.binance(),
      bybit: new ccxt.bybit(),
    };
    this.marketsFile = marketsFile;
    this.listingsHistory = [];
    this.delistingsHistory = [];
  }

  async checkListings(telegramService) {
    console.log('Початок перевірки лістингів...');
    const previousMarkets = await readJsonFile(this.marketsFile);
    console.log('Попередні ринки:', previousMarkets);
    const newMarkets = {};

    for (const [exchangeName, exchange] of Object.entries(this.exchanges)) {
      try {
        console.log(`Завантаження ринків для ${exchangeName}...`);
        const markets = await exchange.loadMarkets();
        const currentPairs = Object.keys(markets);
        console.log(`Поточні пари для ${exchangeName}:`, currentPairs.slice(0, 5), '...');
        newMarkets[exchangeName] = currentPairs;

        const prevPairs = new Set(previousMarkets[exchangeName] || []);
        const currPairs = new Set(currentPairs);

        const newListings = [...currPairs].filter((pair) => !prevPairs.has(pair));
        if (newListings.length) {
          for (const pair of newListings) {
            const message = `🟢 Новий лістинг на ${exchangeName}\n` +
                           `Монета: *${pair}*\n` +
                           `Час: ${formatDateTime(new Date())}`;
            console.log('Виявлено новий лістинг:', pair);
            await telegramService.sendMessage(message);
          }
          this.listingsHistory.push({
            exchange: exchangeName,
            pairs: newListings,
            timestamp: new Date().toISOString(),
          });
        }

        const delistings = [...prevPairs].filter((pair) => !currPairs.has(pair));
        if (delistings.length) {
          for (const pair of delistings) {
            const message = `🔴 Делістинг на ${exchangeName}\n` +
                           `Монета: *${pair}*\n` +
                           `Час: ${formatDateTime(new Date())}`;
            console.log('Виявлено делістинг:', pair);
            await telegramService.sendMessage(message);
          }
          this.delistingsHistory.push({
            exchange: exchangeName,
            pairs: delistings,
            timestamp: new Date().toISOString(),
          });
        }

        // Затримка 1 секунда між біржами
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Помилка на ${exchangeName}:`, error.message);
      }
    }

    console.log('Оновлення ринків:', newMarkets);
    await writeJsonFile(this.marketsFile, newMarkets);
    console.log('Перевірка завершена.');
  }

  getListingsHistory() {
    return this.listingsHistory;
  }

  getDelistingsHistory() {
    return this.delistingsHistory;
  }
}





export default ExchangeService;