import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),
  
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  getMe: () =>
    apiClient.get('/auth/me')
};

export const chatService = {
  getChats: () =>
    apiClient.get('/chats'),
  
  createOrGetChat: (userId) =>
    apiClient.post('/chats', { userId }),
  
  createGroupChat: (groupName, users) =>
    apiClient.post('/chats/group', { groupName, users }),
  
  addToGroup: (chatId, userId) =>
    apiClient.post('/chats/group/add', { chatId, userId }),
  
  removeFromGroup: (chatId, userId) =>
    apiClient.post('/chats/group/remove', { chatId, userId }),
  
  searchUsers: (query) =>
    apiClient.get(`/chats/search?query=${query}`)
};

export const messageService = {
  getMessages: (chatId, page = 1, limit = 50) =>
    apiClient.get(`/messages/${chatId}?page=${page}&limit=${limit}`),
  
  sendMessage: (chatId, content, imageUrl = null) =>
    apiClient.post('/messages', { chatId, content, imageUrl }),
  
  markAsRead: (messageId) =>
    apiClient.post('/messages/read', { messageId }),
  
  markAsDelivered: (messageId) =>
    apiClient.post('/messages/delivered', { messageId })
};
