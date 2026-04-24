import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/api';
import MessageBubble from './MessageBubble';
import { getSocket } from '../services/socket';

export const ChatWindow = ({ chat, currentUser, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = getSocket();
  const typingTimeoutRef = useRef(null);

   const currentUserId = currentUser?._id || currentUser?.id; 

  useEffect(() => {
    if (chat) {
      loadMessages();
      socket.emit('join-chat', chat._id);
    }

    return () => {
      if (chat) {
        socket.emit('leave-chat', chat._id);
      }
    };
  }, [chat]);

  useEffect(() => {
    socket.on('receive-message', (data) => {
      if (data.chatId === chat?._id) {
        setMessages(prev => [...prev, data]);
      }
    });

    socket.on('user-typing', (data) => {
      if (data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          if (prev.some(u => u.userId === data.userId)) return prev;
          return [...prev, data];
        });
      }
    });

    socket.on('user-stop-typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, [chat, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(chat._id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    socket.emit('typing', {
      chatId: chat._id,
      userId: currentUser?.id,
      userName: currentUser?.name
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', {
        chatId: chat._id,
        userId: currentUser?.id
      });
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    try {
      const messageData = {
        _id: Date.now().toString(),
        sender: currentUser?.id,
        chatId: chat._id,
        content: inputValue,
        imageUrl: null,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, messageData]);
      setInputValue('');

      socket.emit('send-message', messageData);
      socket.emit('stop-typing', {
        chatId: chat._id,
        userId: currentUser?.id
      });

      await messageService.sendMessage(chat._id, inputValue);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getOtherUser = () => {
    if (!chat.users) return null;
    return chat.users.find(u => u._id !== currentUser?.id);
  };

  const getSenderName = (senderId) => {
    if (chat.isGroupChat) {
      const user = chat.users.find(u => u._id === senderId);
      return user?.name || 'Unknown';
    }
    return null;
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="border-b p-4 bg-white shadow">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
            {chat.isGroupChat ? '👥' : getOtherUser()?.avatar?.charAt(0) || '👤'}
          </div>
          <div className="flex-1 ml-3">
            <h2 className="font-bold text-gray-900">
              {chat.isGroupChat ? chat.groupName : getOtherUser()?.name}
            </h2>
            {!chat.isGroupChat && getOtherUser()?.isOnline && (
              <p className="text-xs text-green-600">Online</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message._id || index}
              message={message}
              isOwn={message.sender === currentUser?.id}
              senderName={chat.isGroupChat ? getSenderName(message.sender) : null}
            />
          ))
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-sm text-gray-500">
              {typingUsers.map(u => u.userName).join(', ')} {'is' + (typingUsers.length > 1 ? '' : '')} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-2 font-semibold transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
