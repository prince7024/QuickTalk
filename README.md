# Real-Time Chat Application

A full-stack MERN chat application with real-time messaging using Socket.io, JWT authentication, and group chat support.

## 🚀 Features

- User Authentication (JWT)
- One-to-One Messaging
- Group Chat
- Real-time Typing Indicator
- Online/Offline Status
- Message Read/Delivered Status
- User Search
- Responsive Design

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB altas
- npm 

## 🔧 Installation

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

4. Start MongoDB (if local):
```bash
mongod
```

5. Start backend server:
```bash
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
real-time chat application/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   └── messageController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Chat.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   └── messageRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── database.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ChatListItem.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ChatContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Chats
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create or get one-to-one chat
- `POST /api/chats/group` - Create group chat
- `POST /api/chats/group/add` - Add user to group
- `POST /api/chats/group/remove` - Remove user from group
- `GET /api/chats/search?query=` - Search users

### Messages
- `GET /api/messages/:chatId` - Get messages for chat
- `POST /api/messages` - Send message
- `POST /api/messages/read` - Mark message as read
- `POST /api/messages/delivered` - Mark message as delivered

## 🔌 Socket.io Events

### Client to Server
- `user-login` - User logs in
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `message-delivered` - Message delivered
- `message-read` - Message read

### Server to Client
- `receive-message` - New message received
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `message-delivered-notification` - Message delivery notification
- `message-read-notification` - Message read notification
- `user-online` - User came online
- `user-offline` - User went offline

## 🚀 Usage

1. Open `http://localhost:5173` in your browser
2. Create an account or login
3. Search for users to start chatting
4. Create groups with multiple users
5. Send and receive messages in real-time

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected API routes
- CORS enabled for frontend

## 📦 Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- socket.io - Real-time communication
- cors - Cross-origin resource sharing
- dotenv - Environment variables

### Frontend
- react - UI library
- react-router-dom - Routing
- socket.io-client - Socket.io client
- axios - HTTP client
- tailwindcss - CSS framework
- vite - Build tool
- date-fns - Date formatting

