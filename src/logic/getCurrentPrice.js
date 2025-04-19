import ccxt from "ccxt";

export async function getCurrentPrice(symbol, exchangeName = "binance") {
  try {
    const exchangeClass = ccxt[exchangeName];
    if (!exchangeClass) {
      throw new Error(`Невідома біржа: ${exchangeName}`);
    }

    const exchange = new exchangeClass();
    await exchange.loadMarkets();

    const marketSymbol = `${symbol}/USDT`;
    if (!exchange.markets[marketSymbol]) {
      throw new Error(`Пара ${marketSymbol} не знайдена на ${exchangeName}`);
    }

    const ticker = await exchange.fetchTicker(marketSymbol);
    console.log(ticker,'ticker');
    
    return ticker.last?.toFixed(6);
  } catch (err) {
    console.error("Помилка отримання ціни:", err.message);
    return "Недоступно";
  }
}
