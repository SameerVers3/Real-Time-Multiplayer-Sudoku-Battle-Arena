// src/components/RoomDetails.tsx

import React from 'react';
import { useTheme } from '../contexts/UserContext';
// import { User } from 'lucide-react'; // Assuming you're using lucide-react for icons
import { FaUserAlt } from "react-icons/fa";
import GameTimer from './GameTimer';

type JoinedBy = {
  userID: string;
  userName: string | null;
  photoURL: string | null;
}

interface RoomDetailsProps {
  maxMembers: number;
  joinedBy: JoinedBy[];
  roomId: string | undefined;
  onGameEnd: () => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ maxMembers, joinedBy, roomId, onGameEnd }) => {
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const textColor = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';

  return (
    <div  className='flex gap-2 p-0.5'>
      
    <div className={`flex flex-row justify-center items-center gap p-2 sm:p-4 rounded-lg ${bgColor}`}>
      <div className={`text-2xl sm:text-4xl font-bold ${textColor}`}>
        <GameTimer roomId={roomId ?? ''} onGameEnd={onGameEnd}/>
      </div>
    </div>
    <div className={`flex flex-row gap sm:text-2xl p-1 sm:p-4 justify-center items-center gap-2 rounded-lg ${bgColor}`}>
    <FaUserAlt /> 
        <div className={`   flex items-center ${textColor}`}>
        <span className="font-medium sm:font-bold">
          {joinedBy.length} / {maxMembers}
        </span>
    <div>

    </div>
  </div>
  </div>
    </div>

  );
};

export default RoomDetails;
