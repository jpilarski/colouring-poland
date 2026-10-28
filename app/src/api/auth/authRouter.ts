import express from 'express';
import authController from './authController';

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/api/key', authController.generateApiKey);

export default router;

