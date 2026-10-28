import express from 'express';
import autofillController from '../controllers/autofillController';

const router = express.Router();

router.get('/', autofillController.getAutofillOptions);

export default router;

