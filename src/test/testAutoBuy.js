import dotenv from 'dotenv';
dotenv.config();

import autoBuyHandler from '../logic/autoBuyHandler.js';

const runTest = async () => {
  try {
    const symbol = 'TRX'; // або будь-яка інша монета з підтримкою на біржі
    const amount = 5;      // наприклад 5 USDT

    const result = await autoBuyHandler(symbol, amount);
    console.log('✅ Результат покупки:', result);
  } catch (error) {
    console.error('❌ Помилка тесту:', error.message);
  }
};

runTest();
