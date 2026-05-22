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
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 px-2`}>
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg break-words ${
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
        
        <p className="break-words whitespace-pre-wrap text-sm">{message.content}</p>
        
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
