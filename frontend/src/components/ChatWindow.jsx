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
    const handleReceiveMessage = (data) => {
      if (data.chatId === chat?._id) {
        setMessages(prev => [...prev, data]);
      }
    };

    const handleUserTyping = (data) => {
      if (data.userId !== currentUser?.id) {
        setTypingUsers(prev => {
          if (prev.some(u => u.userId === data.userId)) return prev;
          return [...prev, data];
        });
      }
    };

    const handleUserStopTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
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
      const currentInput = inputValue;
      setInputValue('');
      socket.emit('stop-typing', {
        chatId: chat._id,
        userId: currentUser?.id
      });

      const response = await messageService.sendMessage(chat._id, currentInput);
      
      if (response.data.success && response.data.message) {
        setMessages(prev => [...prev, response.data.message]);
        
        socket.emit('send-message', {
          ...response.data.message,
          chatId: chat._id
        });
      }
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
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b p-4 bg-white shadow flex-shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
            {chat.isGroupChat ? '👥' : getOtherUser()?.avatar?.charAt(0) || '👤'}
          </div>
          <div className="flex-1 ml-3 min-w-0">
            <h2 className="font-bold text-gray-900 truncate">
              {chat.isGroupChat ? chat.groupName : getOtherUser()?.name}
            </h2>
            {!chat.isGroupChat && getOtherUser()?.isOnline && (
              <p className="text-xs text-green-600">Online</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 w-full">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message._id || index}
              message={message}
              isOwn={message.sender?._id === currentUserId || message.sender === currentUserId}
              senderName={chat.isGroupChat ? getSenderName(message.sender?._id || message.sender) : null}
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

      <form onSubmit={handleSendMessage} className="border-t p-4 bg-white flex gap-2 flex-shrink-0 w-full overflow-hidden">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 min-w-0 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 py-2 sm:px-6 font-semibold transition-colors flex-shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
