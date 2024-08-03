import React from 'react';
import { useTheme } from '../contexts/UserContext';

interface MessageProps {
  message: string;
  time: string;
  sender: string | undefined | null;
  photoURL: string | undefined | null;
}

const IncomingMessage: React.FC<MessageProps> = ({ message, time, sender, photoURL }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`chat chat-start ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {photoURL && <img src={photoURL} alt={sender || "User"} className="w-10 h-10 rounded-full" />}
        </div>
      </div>
      <div className="chat-header">
        {sender}
        <time className="text-xs opacity-50 ml-4">{new Date(time).toLocaleTimeString()}</time>
      </div>
      <div className={`chat-bubble ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>{message}</div>
    </div>
  );
};

export default IncomingMessage;
