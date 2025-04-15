function extractSymbolsFromTitle(title) {
    const regex = /([A-Z0-9]{2,})(USDT)?/g;
    const matches = title.match(regex);
    if (!matches) return [];
  
    // Видаляємо 'USDT' із кожного збігу та повертаємо унікальні символи
    return [...new Set(matches.map(m => m.replace('USDT', '')))];
  }
  
  export default extractSymbolsFromTitle;
  