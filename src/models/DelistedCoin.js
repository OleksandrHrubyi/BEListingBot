// models/DelistedCoin.js
import mongoose from 'mongoose';

const delistedCoinSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // Наприклад: "TRX"
  name: { type: String }, // Наприклад: "TRON"
  exchange: { type: String, required: true }, // Наприклад: "Binance" або "Bybit"
  reason: { type: String }, // Якщо є причина (optional)
  dateDetected: { type: Date, default: Date.now }, // коли бот виявив
  delistDate: { type: Date }, // якщо в новині була дата делістингу
});

export const DelistedCoin = mongoose.model('DelistedCoin', delistedCoinSchema);
