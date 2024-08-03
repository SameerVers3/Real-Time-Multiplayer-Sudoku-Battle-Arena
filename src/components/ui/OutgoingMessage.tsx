import React from 'react';

interface MessageProps {
  message: string;
  time: string;
  sender: string | undefined | null;
  photoURL: string | undefined | null;
}

const OutgoingMessage: React.FC<MessageProps> = ({ message, time, sender, photoURL }) => {
  return (
    // <div className="flex justify-end mb-2">
    //   <div
    //     className="p-3 rounded-lg bg-green-200"
    //   >
    //     <p className="text-sm">{message}</p>
    //     <p className="text-xs text-gray-500 mt-1">{new Date(time).toLocaleTimeString()}</p>
    //   </div>
    // </div>

    <div className="chat chat-end">
    <div className="chat-image avatar">
      <div className="w-10 rounded-full">
        {photoURL && <img src={photoURL} alt={sender || "User"} className="w-6 h-6 rounded-full mr-2" />}
      </div>
    </div>
    <div className="chat-header">
      {sender}
    </div>
    <div className="chat-bubble">
      <div>
        {message}
      </div>
    </div>
    <time className="text-xs opacity-50 mr-4">{new Date(time).toLocaleTimeString()}</time>
    </div>
  );
};

export default OutgoingMessage;
