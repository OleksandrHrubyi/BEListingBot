import { Router } from 'express';
const router = Router();

export default (exchangeService) => {
  router.get('/listings', (req, res) => {
    res.json(exchangeService.getListingsHistory());
  });

  router.get('/delistings', (req, res) => {
    res.json(exchangeService.getDelistingsHistory());
  });

  return router;
};