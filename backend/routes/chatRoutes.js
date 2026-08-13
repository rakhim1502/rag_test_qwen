import express from 'express';
import { chat, explain } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, chat);
router.post('/explain', protect, explain);

export default router;
