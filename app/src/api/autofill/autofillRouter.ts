import express from 'express';
import autofillController from './autofillController';

const router = express.Router();

router.get('/', autofillController.getAutofillOptions);

export default router;
