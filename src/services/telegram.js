import TelegramBot from 'node-telegram-bot-api';

class TelegramService {
    constructor(token, chatId) {
        console.log('Ініціалізація TelegramService з token:', token ? 'наявний' : 'відсутній');
        console.log('Chat ID:', chatId);
        this.bot = new TelegramBot(token);
        this.chatId = chatId;
      }
    
      async sendMessage(message) {
        console.log('Спроба відправити повідомлення:', message);
        try {
          await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
          console.log('Повідомлення успішно відправлено:', message);
        } catch (error) {
          console.error('Помилка відправки повідомлення:', error.message);
        }
      }
}

export default TelegramService;