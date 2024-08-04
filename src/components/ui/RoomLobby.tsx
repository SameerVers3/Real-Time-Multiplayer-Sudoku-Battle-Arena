import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { useDatabase } from '~/lib/firebase';
import { useAuthState } from '../contexts/UserContext';
import { useTheme } from '../contexts/UserContext';
import RoomId from './RoomId';

interface RoomLobbyProps {
  roomId: string;
  maxMembers: number;
  onStartGame: () => void;
}

interface LobbyMember {
  memberID: string;
  memberName: string | null;
  photoURL: string | null;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ roomId, maxMembers, onStartGame }) => {
  const [members, setMembers] = useState<LobbyMember[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [createrId, setCreaterId] = useState<string>();
  const database = useDatabase();
  const { state } = useAuthState();
  const { theme } = useTheme(); // Use the theme hook

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        const currentMembers = Object.values(roomData.currentMembers || {}) as LobbyMember[];
        setMembers(currentMembers);
        setCreaterId(roomData.creatorId);
        
        if (state.state === 'SIGNED_IN' && state.currentUser) {
          setIsCreator(roomData.creatorId === state.currentUser.uid);
        }
      }
    });

    return () => unsubscribe();
  }, [database, roomId, state]);

  const handleStartGame = () => {
    if (isCreator) {
      const roomRef = ref(database, `rooms/${roomId}`);
      update(roomRef, { isActive: true }).then(() => {
        onStartGame();
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'text-white' : ' text-gray-900'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sudoku Room</h2>
      <div className={`flex justify-center items-center gap-5 text-xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        Players: 
        <div>
          <span className='text-3xl font-bold'> {members.length}</span> / {maxMembers}
        </div>
      </div>
      <div className='flex flex-col gap-8'>
        <RoomId 
            roomId={roomId}
            shareUrl='http://localhost:5173/play/'
          />
        <div className="flex flex-col space-y-4 mb-6 w-full max-w-lg">
          {members.map((member) => (
            <div key={member.memberID} className={`flex items-center space-x-4 p-3 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <img 
                src={member.photoURL || '/default-avatar.png'} 
                alt={member.memberName || 'Unknown'} 
                className="w-12 h-12 rounded-full border-2 border-gray-300" 
              />
              <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {member.memberName || 'Unknown'}
              </span>
              {
                (member.memberID == createrId) && 
                <div className={`badge p-3 border ${theme === 'dark' ? 'text-gray-200 border-gray-500' : 'border-gray-300'}`}>
                  Creater
                </div>
              }
            </div>
          ))}
        </div>
      </div>
      {isCreator ? (
        <button
          onClick={handleStartGame}
          className={`px-6 py-3 rounded-lg font-semibold ${members.length < 2 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
          disabled={members.length < 2}
        >
          Start Game
        </button>
      ) : (
        <p className={`text-center text-lg italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Waiting for the room creator to start the game...
        </p>
      )}
    </div>
  );
};

export default RoomLobby;
