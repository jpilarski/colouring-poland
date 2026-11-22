import express from 'express';
// Optional IP rate limiter available in '../common/rateLimiters' (loginLimiter)
import authController from './authController';

const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/key', authController.generateApiKey);

export default router;
