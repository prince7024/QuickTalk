import express from 'express';
import {
  getChats,
  createOrGetChat,
  createGroupChat,
  addToGroup,
  removeFromGroup,
  searchUsers
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getChats);
router.post('/', createOrGetChat);
router.post('/group', createGroupChat);
router.post('/group/add', addToGroup);
router.post('/group/remove', removeFromGroup);
router.get('/search', searchUsers);

export default router;
