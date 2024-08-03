import React from 'react';

interface NotificationProps {
  message: string;
  time: string;
}

const Notification: React.FC<NotificationProps> = ({ message, time }) => {
  return (
    <div className="p-3 rounded-lg mb-2 bg-gray-200">
      <p className="text-sm">{message}</p>
      <p className="text-xs text-gray-500 mt-1">{new Date(time).toLocaleTimeString()}</p>
    </div>
  );
};

export default Notification;
