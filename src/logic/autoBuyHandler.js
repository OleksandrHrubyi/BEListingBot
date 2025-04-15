import exchange from '../exchange/spot.js';

export default async function autoBuyHandler(symbol, usdtAmount) {
  try {
    const marketSymbol = `${symbol}/USDT`;

    // Перевіримо, чи біржа підтримує цей символ
    const markets = await exchange.loadMarkets();
    if (!markets[marketSymbol]) {
      throw new Error(`❌ Ринок ${marketSymbol} не підтримується біржею`);
    }

    // Отримуємо поточну ціну
    const ticker = await exchange.fetchTicker(marketSymbol);
    const price = ticker.ask || ticker.last;

    // Розрахунок кількості з урахуванням простої комісії
    const feeRate = 0.001; // 0.1%
    const totalWithFee = usdtAmount * (1 - feeRate);
    const amount = parseFloat((totalWithFee / price).toFixed(6));

    const order = await exchange.createMarketBuyOrder(marketSymbol, amount);

    console.log(`✅ Куплено ${amount} ${symbol} по ринку`, order);
    return order;

  } catch (error) {
    console.error(`❌ Помилка при купівлі ${symbol}:`, error.message);
    throw error;
  }
}
