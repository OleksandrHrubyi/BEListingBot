import { Router } from 'express';
const router = Router();

export default (exchangeService) => {
    router.get('/listings', (req, res) => {
        res.json(exchangeService.getListingsHistory());
      });
    
      router.get('/delistings', (req, res) => {
        res.json(exchangeService.getDelistingsHistory());
      });
    
      router.post('/test-telegram', async (req, res) => {
        const { message } = req.body;
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }
        try {
          await telegramService.sendMessage(message);
          res.json({ success: true, message: 'Повідомлення відправлено' });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    
      // Новий маршрут /check
      router.get('/check', (req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          message: 'Бот працює нормально'
        });
      });

  return router;
};