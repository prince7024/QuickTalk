import React, { useState, useEffect } from 'react';
import { chatService } from '../services/api';

export const Sidebar = ({ chats, onSelectChat, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await chatService.searchUsers(query);
        setSearchResults(response.data.users);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const response = await chatService.createOrGetChat(userId);
      onSelectChat(response.data.chat);
      setSearchQuery('');
      setShowSearchResults(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      alert('Group name and at least 2 users are required');
      return;
    }

    try {
      const response = await chatService.createGroupChat(groupName, selectedUsers);
      onSelectChat(response.data.chat);
      setGroupName('');
      setSelectedUsers([]);
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <div className="w-full sm:w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chats</h1>
        
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search or start new chat"
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 z-10 max-h-60 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm">No users found</p>
              ) : (
                searchResults.map(user => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowCreateGroup(!showCreateGroup)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors mb-2"
        >
          {showCreateGroup ? 'Cancel' : 'New Group'}
        </button>

        {showCreateGroup && (
          <div className="bg-gray-50 p-3 rounded-lg mb-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="mb-2 max-h-32 overflow-y-auto">
              {searchResults.map(user => (
                <label key={user._id} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user._id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{user.name}</span>
                </label>
              ))}
            </div>
            
            <button
              onClick={handleCreateGroup}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-medium text-sm transition-colors"
            >
              Create
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No chats yet</p>
            <p className="text-xs mt-2">Search for users to start chatting</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                  {chat.isGroupChat ? '👥' : (chat.users[0]?.name?.charAt(0) || '👤')}
                </div>
                <div className="flex-1 ml-3 overflow-hidden">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {chat.isGroupChat ? chat.groupName : chat.users.find(u => u._id !== currentUserId)?.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage?.content || 'No messages'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
