import express from 'express';
import mapStatsController from '../controllers/mapStatsController';

const router = express.Router();

router.get('/', mapStatsController.getMapStats);

export default router;
