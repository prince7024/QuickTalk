import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Settings, LogOut, User } from 'lucide-react';
import { chatService } from '../services/api';

export const Sidebar = ({ chats, onSelectChat, currentUserId, currentUser, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});
  const [openUp, setOpenUp] = useState(false);

  const userName = currentUser?.name || currentUser?.email || 'Anonymous';
  const initials = userName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (showProfileMenu) {
        computeMenuPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showProfileMenu]);

  const computeMenuPosition = () => {
    const btn = buttonRef.current;
    const menu = menuRef.current;
    if (!btn) return;

    const btnRect = btn.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight || 160;
    const menuWidth = menu?.offsetWidth || 176;

    const spaceBelow = window.innerHeight - btnRect.bottom;
    const spaceAbove = btnRect.top;

    const preferUp = spaceBelow < menuHeight && spaceAbove > menuHeight;

    const style = {
      position: 'absolute',
      minWidth: `${menuWidth}px`,
      zIndex: 9999,
    };

    if (preferUp) {
      style.bottom = 'calc(100% + 8px)';
      style.top = 'auto';
    } else {
      style.top = 'calc(100% + 8px)';
      style.bottom = 'auto';
    }

    // horizontal placement: prefer align right inside parent, but adjust if overflowing viewport
    const parentRect = profileMenuRef.current?.getBoundingClientRect();
    if (parentRect) {
      const spaceRight = window.innerWidth - parentRect.right;
      const spaceLeft = parentRect.left;
      if (spaceRight < menuWidth && spaceLeft > menuWidth) {
        style.right = '0';
        style.left = 'auto';
      } else {
        style.left = '0';
        style.right = 'auto';
      }
    } else {
      style.right = '0';
    }

    setMenuStyle(style);
    setOpenUp(preferUp);
  };

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

      <div className="border-t bg-white p-4 sticky bottom-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-white font-semibold text-base">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              ref={buttonRef}
              onClick={() => {
                const next = !showProfileMenu;
                setShowProfileMenu(next);
                if (next) {
                  // compute placement after open
                  setTimeout(() => computeMenuPosition(), 0);
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Open profile menu"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showProfileMenu && (
              <div
                ref={menuRef}
                style={menuStyle}
                className={`bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden text-sm ${openUp ? 'origin-bottom-right' : 'origin-top-right'}`}
              >
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600">
                    <User className="w-4 h-4" />
                  </span>
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600">
                    <Settings className="w-4 h-4" />
                  </span>
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout?.();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600">
                    <LogOut className="w-4 h-4" />
                  </span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
