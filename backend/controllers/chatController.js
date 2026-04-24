import Chat from '../models/Chat.js';
import User from '../models/User.js';

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user.id })
      .populate('users', 'name email avatar isOnline')
      .populate('admin', 'name email')
      .populate('lastMessage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      chats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrGetChat = async (req, res) => {
  try {
    const { userId } = req.body;

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user.id, userId] }
    }).populate('users', 'name email avatar isOnline');

    if (chat) {
      return res.status(200).json({
        success: true,
        chat
      });
    }

    const newChat = await Chat.create({
      isGroupChat: false,
      users: [req.user.id, userId]
    });

    const populatedChat = await newChat.populate('users', 'name email avatar isOnline');

    res.status(201).json({
      success: true,
      chat: populatedChat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    const { groupName, users } = req.body;

    if (!groupName || !users || users.length < 2) {
      return res.status(400).json({ message: 'Group name and at least 2 users are required' });
    }

    const groupChat = await Chat.create({
      isGroupChat: true,
      groupName,
      users: [req.user.id, ...users],
      admin: req.user.id
    });

    const populatedChat = await groupChat.populate('users', 'name email avatar isOnline');

    res.status(201).json({
      success: true,
      chat: populatedChat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Not a group chat' });
    }

    if (chat.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admin can add users' });
    }

    if (chat.users.includes(userId)) {
      return res.status(400).json({ message: 'User already in group' });
    }

    chat.users.push(userId);
    await chat.save();

    const updatedChat = await chat.populate('users', 'name email avatar isOnline');

    res.status(200).json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat.isGroupChat) {
      return res.status(400).json({ message: 'Not a group chat' });
    }

    if (chat.admin.toString() !== req.user.id && req.user.id !== userId) {
      return res.status(403).json({ message: 'Only admin can remove users' });
    }

    chat.users = chat.users.filter(u => u.toString() !== userId);
    await chat.save();

    const updatedChat = await chat.populate('users', 'name email avatar isOnline');

    res.status(200).json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email avatar isOnline');

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
