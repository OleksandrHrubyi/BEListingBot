import axios from 'axios';
import extractSymbolsFromTitle from '../utils/helpers.js';

export async function fetchBybitDelistings() {
  try {
    const response = await axios.post(
      'https://api2.bybit.com/announcements/api/search/v1/index/announcement-posts_en',
      {
        query: '',
        page: 0,
        hitsPerPage: 8,
        filters: "category.key: 'delistings'",
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
const currenciesDelisting = []
const items = response?.data?.result?.hits || [];
items.forEach(item => {
    const symbols = extractSymbolsFromTitle(item.title);
    currenciesDelisting.push(...symbols);
    console.log(`Found symbols: ${symbols.join(', ')}`);
});
console.log(currenciesDelisting);


    return response?.data?.result?.hits || [];
  } catch (error) {
    console.error('❌ Error fetching Bybit delistings:', error.message);
    return [];
  }
}

fetchBybitDelistings()
