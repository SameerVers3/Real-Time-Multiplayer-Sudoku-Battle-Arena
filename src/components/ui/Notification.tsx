import React from 'react';
import { useTheme } from '../contexts/UserContext';

interface NotificationProps {
  message: string;
  time: string;
}

const Notification: React.FC<NotificationProps> = ({ message, time }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex flex-col justify-between items-center p-2 rounded-lg mb-2`}>
      <p className="text-sm">{message}</p>
      <p className="text-xs opacity-50 mt-1">{new Date(time).toLocaleTimeString()}</p>
    </div>
  );
};
export default Notification;
