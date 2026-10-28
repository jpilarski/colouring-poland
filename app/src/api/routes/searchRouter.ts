import express from 'express';
import searchController from '../controllers/searchController';

const router = express.Router();

router.get('/', searchController.searchLocations);

export default router;

