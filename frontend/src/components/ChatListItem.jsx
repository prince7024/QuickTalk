import React from 'react';

export const ChatListItem = ({ chat, onSelect, isActive, currentUserId }) => {
  const getOtherUser = () => {
    if (!chat.users) return null;
    return chat.users.find(u => u._id !== currentUserId);
  };

  const getChatName = () => {
    if (chat.isGroupChat) {
      return chat.groupName;
    }
    return getOtherUser()?.name || 'Unknown';
  };

  const getLastMessage = () => {
    if (!chat.lastMessage) return 'No messages yet';
    if (chat.lastMessage.sender === currentUserId) {
      return `You: ${chat.lastMessage.content}`;
    }
    return chat.lastMessage.content;
  };

  const getChatAvatar = () => {
    if (chat.isGroupChat) {
      return chat.groupAvatar || '👥';
    }
    return getOtherUser()?.avatar || '👤';
  };

  const isOnline = getOtherUser()?.isOnline;

  return (
    <div
      onClick={onSelect}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-100'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center">
        <div className="relative">
          {typeof getChatAvatar() === 'string' && getChatAvatar().includes('/') ? (
            <img
              src={getChatAvatar()}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg">
              {getChatAvatar()}
            </div>
          )}
          {!chat.isGroupChat && isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        
        <div className="flex-1 ml-3 overflow-hidden">
          <h3 className="font-semibold text-gray-900 truncate">{getChatName()}</h3>
          <p className="text-sm text-gray-600 truncate">{getLastMessage()}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
