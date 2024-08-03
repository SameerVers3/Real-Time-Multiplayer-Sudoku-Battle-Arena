import React, { useState } from 'react';
import { useTheme } from '../contexts/UserContext';
import { Copy, Share2, Check } from 'lucide-react';

interface RoomIdProps {
  roomId: string;
  shareUrl: string;
}

const RoomId: React.FC<RoomIdProps> = ({ roomId, shareUrl }) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((error) => {
        console.error('Failed to copy text: ', error);
      });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Soduku Room ID',
        text: `Wanna Play Sudoku with me? check out this room ID : ${roomId}`,
        url: `${shareUrl + roomId}`
      })
      .then(() => console.log('Share successful'))
      .catch((error) => console.error('Share failed: ', error));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Share link copied to clipboard!'))
        .catch((error) => console.error('Failed to copy share link: ', error));
    }
  };

  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const iconColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`mx-auto flex items-center gap-2 ${bgColor} rounded-md p-2 w-fit gap-5`}>
      <div>
        Room Id: 
      </div>
      <div className='flex justify-center items-center gap-3'>
        <div 
          className={`flex items-center gap-2 cursor-pointer ${textColor} text-xl font-medium`}
          onClick={handleCopy}
        >
          <span>{roomId}</span>
          {copied ? (
            <Check size={16} className={iconColor} />
          ) : (
            <Copy size={16} className={iconColor} />
          )}
        </div>
        <button
          className={`p-1 rounded transition-colors ${bgColor} hover:bg-opacity-80`}
          onClick={handleShare}
        >
          <Share2 size={16} className={iconColor} />
        </button>
      </div>
    </div>
  );
}

export default RoomId;