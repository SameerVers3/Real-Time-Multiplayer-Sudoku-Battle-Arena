import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import IncomingMessage from './IncomingMessage';
import OutgoingMessage from './OutgoingMessage';
import Notification from './Notification';
import { useTheme } from '../contexts/UserContext';
import { IoIosSend } from "react-icons/io";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme() ?? {};

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close the emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  function breakIntoLines(input: string, maxLength: number = 35): string {
    const lines: string[] = [];
    let currentLine = '';

    // Split input into words
    const words = input.split(' ');

    words.forEach(word => {
        // If the current word is longer than maxLength, break it into chunks
        while (word.length > maxLength) {
            // Add a chunk of the word to the currentLine
            lines.push(word.slice(0, maxLength));
            word = word.slice(maxLength);
        }

        // If adding the word to the current line would exceed maxLength
        if (currentLine.length + word.length + (currentLine.length ? 1 : 0) > maxLength) {
            // Push the current line to the lines array
            lines.push(currentLine);
            // Start a new line with the current word
            currentLine = word;
        } else {
            // Otherwise, add the word to the current line
            currentLine += (currentLine ? ' ' : '') + word;
        }
    });

    // Add any remaining text in currentLine to the lines array
    if (currentLine) {
        lines.push(currentLine);
    }

    return lines.join('\n');
}



  return (
    <div className={`flex flex-col max-h-[80vh] rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300'} text-white font-bold rounded-t-lg`}>
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
                  message={breakIntoLines(msg.message)}
                  time={msg.time}
                  sender={sender?.userName}
                  photoURL={sender?.photoURL}
                />
              ) : (
                <IncomingMessage
                  key={index}
                  message={breakIntoLines(msg.message)}
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
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
        <div className="relative flex gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`hidden sm:block px-2 py-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            😊
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className={`flex-grow px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
            }`}
          />
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className={`absolute z-10 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-lg`}
              style={{ bottom: '60px', right: '20px' }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={theme as Theme}
                width={300}
                height={400}
              />
            </div>
          )}
          <button
            onClick={handleSendMessage}
            className={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-900 text-white font-bold' : 'bg-gray-300 hover:bg-gray-200 font-bold'
            }`}
          >
            <IoIosSend />
            <div>
              Send
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
