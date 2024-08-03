import React, { useState, useRef, useEffect } from 'react';
import IncomingMessage from './IncomingMessage';
import OutgoingMessage from './OutgoingMessage';
import Notification from './Notification';

interface Message {
  message: string;
  messageType: "message" | "notification";
  time: string;
  senderID: string;
}

interface User {
  userID: string;
  userName: string | null;
  photoURL: string | null;
}

interface MessageProps {
  messages: Message[];
  joinedBy: User[];
  onSendMessage: (message: string) => void;
  userId: string | null;
}

export const MessageComponent: React.FC<MessageProps> = ({ messages, joinedBy, onSendMessage, userId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); 

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh] bg-gray-100 rounded-lg shadow-md">
      <div className="p-4 bg-blue-600 text-white font-bold rounded-t-lg">
        Chat Room
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => {
              const sender = joinedBy.find(user => user.userID === msg.senderID);
              switch (msg.messageType) {
                case "notification":
                  return (
                    <Notification
                      key={index}
                      message={msg.message}
                      time={msg.time}
                    />
                  );
                case "message":
                  return userId === msg.senderID ? (
                    <OutgoingMessage
                      key={index}
                      message={msg.message}
                      time={msg.time}
                      sender={sender?.userName}
                      photoURL={sender?.photoURL}
                    />
                  ) : (
                    <IncomingMessage
                      key={index}
                      message={msg.message}
                      time={msg.time}
                      sender={sender?.userName}
                      photoURL={sender?.photoURL}
                    />
                  );
                default:
                  return null;
              }
            })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};