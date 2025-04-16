// models/DelistedCoin.js
import mongoose from 'mongoose';

const delistedCoinSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Наприклад: "TRX"
  currency: { type: String, required: true }, // Наприклад: "TRX"
  pair: { type: String, required: true }, // Наприклад: "TRXUSDT"
  url: { type: String },
  exchange: { type: String, required: true }, // Наприклад: "Binance" або "Bybit"
  dateDetected: { type: Date, default: Date.now }, // коли бот виявив
  description: { type: String }, // опис новини
  name: { type: String }, // назва монети
});

export const DelistedCoin = mongoose.model('DelistedCoin', delistedCoinSchema);
