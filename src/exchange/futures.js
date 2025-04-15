import ccxt from 'ccxt';
import dotenv from 'dotenv';
dotenv.config();

const futures = new ccxt.bybit({
  apiKey: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  enableRateLimit: true,
  options: {
    defaultType: 'linear', // <-- ф’ючерси USDT
  },
});

export default futures;
