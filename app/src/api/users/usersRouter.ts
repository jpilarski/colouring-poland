import express from 'express';

// Optional IP rate limiter available in '../common/rateLimiters' (passwordResetLimiter)
import userController from './userController';

const router = express.Router();

router.post('/', userController.createUser);

router.route('/me')
    .get(userController.getCurrentUser)
    .delete(userController.deleteCurrentUser);

router.put('/password', userController.resetPassword);

export default router;
