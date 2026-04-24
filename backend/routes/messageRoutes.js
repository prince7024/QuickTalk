import express from 'express';
import {
  getMessages,
  sendMessage,
  markAsRead,
  markAsDelivered
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/:chatId', getMessages);
router.post('/', sendMessage);
router.post('/read', markAsRead);
router.post('/delivered', markAsDelivered);

export default router;
