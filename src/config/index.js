import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Отримуємо шлях до поточної директорії
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const marketsFile = path.join(__dirname, '../../previous_markets.json');
export const telegramToken = process.env.TELEGRAM_TOKEN;
export const telegramChatId = process.env.TELEGRAM_CHAT_ID;
export const port = process.env.PORT || 3000;