import { promises as fs } from 'fs';

export async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Файл не існує, повертаємо порожній об'єкт
      return { binance: [], bybit: [] };
    }
    // Якщо це інша помилка, кидаємо її далі
    throw error;
  }
}

export async function writeJsonFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Помилка запису файлу ${filePath}:`, error.message);
    throw error;
  }
}