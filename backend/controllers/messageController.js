import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .populate('sender', 'name email avatar')
      .populate('readBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ chatId });

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId, content, imageUrl } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Chat ID and content are required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.users.includes(req.user.id)) {
      return res.status(403).json({ message: 'User not in this chat' });
    }

    const message = await Message.create({
      sender: req.user.id,
      chatId,
      content,
      imageUrl: imageUrl || null,
      deliveredTo: chat.users.filter(u => u.toString() !== req.user.id),
      readBy: [req.user.id]
    });

    await message.populate('sender', 'name email avatar');

    chat.lastMessage = message._id;
    await chat.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsDelivered = async (req, res) => {
  try {
    const { messageId } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.deliveredTo.includes(req.user.id)) {
      message.deliveredTo = message.deliveredTo.filter(u => u.toString() !== req.user.id);
      await message.save();
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
