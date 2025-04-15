import ccxt from 'ccxt';
import dotenv from 'dotenv';
dotenv.config();

console.log( process.env.BYBIT_API_KEY);

const exchange = new ccxt.bybit({
  apiKey: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  enableRateLimit: true,
  options: {
    defaultType: 'spot', // або 'linear' для деривативів (ф'ючерси)
  },
});

export default exchange;