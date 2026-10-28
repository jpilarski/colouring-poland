import express from 'express';
import historyController from './historyController';

const router = express.Router();

router.get('/', historyController.getGlobalEditHistory);

export default router;
