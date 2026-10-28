import express from 'express';
import searchController from './searchController';

const router = express.Router();

router.get('/', searchController.searchLocations);

export default router;

