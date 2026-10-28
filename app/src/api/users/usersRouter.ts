import express from 'express';
import userController from './userController';

const router = express.Router();

router.post('/', userController.createUser);
router.get('/me', userController.getCurrentUser);
router.delete('/me', userController.deleteCurrentUser);
router.post('/password', userController.resetPassword);

export default router;
