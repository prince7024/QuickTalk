import React, { createContext, useState, useCallback } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const setTyping = useCallback((userId, userName) => {
    setTypingUsers(prev => {
      if (prev.some(u => u.userId === userId)) return prev;
      return [...prev, { userId, userName }];
    });
  }, []);

  const removeTyping = useCallback((userId) => {
    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
  }, []);

  const value = {
    chats,
    setChats,
    currentChat,
    setCurrentChat,
    messages,
    setMessages,
    addMessage,
    typingUsers,
    setTyping,
    removeTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
