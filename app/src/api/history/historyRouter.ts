import express from 'express';
import * as editHistoryController from './historyController';

const router = express.Router();

router.get('/', editHistoryController.getGlobalEditHistory);

export default router;

