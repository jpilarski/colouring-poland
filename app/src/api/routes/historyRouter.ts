import express from 'express';
import * as editHistoryController from '../controllers/editHistoryController';

const router = express.Router();

router.get('/', editHistoryController.getGlobalEditHistory);

export default router;

