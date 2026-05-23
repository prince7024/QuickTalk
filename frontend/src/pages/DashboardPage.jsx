import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { chatService } from '../services/api';
import { initSocket, getSocket, disconnectSocket } from '../services/socket';

export const DashboardPage = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = getSocket();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    initSocket();
    socket.emit('user-login', userData.id);

    loadChats();
  }, [navigate]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await chatService.getChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden sm:flex sm:flex-col w-80 bg-white border-r">
        <Sidebar
          chats={chats}
          onSelectChat={handleSelectChat}
          currentUserId={currentUser?.id}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="sm:hidden bg-white border-b p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold">Chat App</h1>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
        
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            currentUser={currentUser}
            onSendMessage={loadChats}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-2">Welcome to Chat App</p>
              <p className="text-gray-500">Select a chat or search for users to start messaging</p>
            </div>
          </div>
        )}
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto">
          <Sidebar
            chats={chats}
            onSelectChat={handleSelectChat}
            currentUserId={currentUser?.id}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
