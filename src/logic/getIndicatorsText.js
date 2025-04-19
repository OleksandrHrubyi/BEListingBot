import ccxt from "ccxt";
import {
  EMA,
  SMA,
  RSI,
  MACD,
  OBV,
} from "technicalindicators";

// Отримуємо індикатори і відправляємо повідомлення користувачу
export async function getIndicatorsText(symbol, exchangeName = "binance") {
  try {
    const exchangeClass = ccxt[exchangeName];
    if (!exchangeClass) throw new Error(`Невідома біржа: ${exchangeName}`);

    const exchange = new exchangeClass();
    await exchange.loadMarkets();

    const marketSymbol = `${symbol}/USDT`;
    if (!exchange.markets[marketSymbol]) {
      throw new Error(`Пара ${marketSymbol} не знайдена`);
    }

    const candles = await exchange.fetchOHLCV(marketSymbol, "1h", undefined, 100);
    const closes = candles.map(c => c[4]);
    const volumes = candles.map(c => c[5]);

    // Індикатори
    const ema = EMA.calculate({ period: 20, values: closes });
    const sma = SMA.calculate({ period: 50, values: closes });
    const rsi = RSI.calculate({ period: 14, values: closes });

    const macdInput = {
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    };
    const macd = MACD.calculate(macdInput);

    const obv = OBV.calculate({ close: closes, volume: volumes });

    // Останні значення
    const latestPrice = closes[closes.length - 1];
    const latestEMA = ema[ema.length - 1];
    const latestSMA = sma[sma.length - 1];
    const latestRSI = rsi[rsi.length - 1];
    const latestMACD = macd[macd.length - 1];
    const latestOBV = obv[obv.length - 1];

    // Оцінка тренду
    const trend =
      latestPrice > latestEMA && latestPrice > latestSMA
        ? "🟢 Загальний тренд: висхідний"
        : latestPrice < latestEMA && latestPrice < latestSMA
        ? "🔻 Загальний тренд: низхідний"
        : "🔄 Загальний тренд: нейтральний";

    return {
      text: `
📊 <b>Технічні індикатори:</b>

- Поточна ціна: <b>${latestPrice.toFixed(6)}</b>
- EMA(20): <b>${latestEMA?.toFixed(6)}</b>
- SMA(50): <b>${latestSMA?.toFixed(6)}</b>
- RSI(14): <b>${latestRSI?.toFixed(2)}</b>
${latestRSI < 30 ? "🔻 Перепроданість" : latestRSI > 70 ? "🔺 Перекупленість" : "ℹ️ RSI нейтральний"}

- MACD: <b>${latestMACD.MACD?.toFixed(6)}</b>
- Signal: <b>${latestMACD.signal?.toFixed(6)}</b>
${latestMACD.MACD > latestMACD.signal ? "🟢 MACD вище сигналу – бичачий імпульс" : "🔻 MACD нижче сигналу – ведмежий імпульс"}

- OBV: <b>${latestOBV}</b>

${trend}
      `,
      indicators: {
        ema: latestEMA,
        sma: latestSMA,
        rsi: latestRSI,
        macd: latestMACD.MACD,
        obv: latestOBV,
      }
    };
  } catch (err) {
    console.error("Помилка індикаторів:", err.message);
    return { text: "⚠️ Індикатори недоступні", indicators: {} };
  }
}
