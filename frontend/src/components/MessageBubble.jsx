import React from 'react';

export const MessageBubble = ({ message, isOwn, senderName }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwn && senderName && (
          <p className={`text-sm font-semibold mb-1 ${isOwn ? 'text-blue-100' : 'text-gray-700'}`}>
            {senderName}
          </p>
        )}
        
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="attachment"
            className="max-w-full rounded mb-2"
          />
        )}
        
        <p className="break-words">{message.content}</p>
        
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
