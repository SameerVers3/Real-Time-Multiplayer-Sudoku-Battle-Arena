// OthersProgress.tsx
import React, { useEffect, useState, useCallback } from 'react';
import ProgressBoard from './ProgressBoard'; // Make sure the path is correct
import { useDatabase } from '~/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuthState } from '../contexts/UserContext';
import { User } from 'firebase/auth';

interface RoomMember {
  memberID: string;
  memberName: string | null;
  photoURL: string | null;
  gameBoard: number[][];
  remainingLives: number;
  totalLives: number;
}

interface Room {
  roomID: string;
  board: number[][];
  solution: number[][];
  currentMembers: { [key: string]: RoomMember };
}

const OthersProgress: React.FC<{ roomId: string | undefined }> = ({ roomId }) => {
  const [membersProgress, setMembersProgress] = useState<{ [key: string]: RoomMember }>({});
  const [roomSolution, setRoomSolution] = useState<number[][] | null>(null);
  const [actualBoard, setActualBoard] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { state } = useAuthState();
  const database = useDatabase();

  const fetchRoomData = useCallback(() => {
    if (state.state === "SIGNED_IN" && state.currentUser) {
      const user = state.currentUser as User;
      const userId = user.uid;
      const roomRef = ref(database, `rooms/${roomId}`);

      const unsubscribe = onValue(roomRef, snapshot => {
        if (snapshot.exists()) {
          const roomData = snapshot.val() as Room;
          const members = roomData.currentMembers;

          // Set the room solution
          setRoomSolution(roomData.solution);
          setActualBoard(roomData.board);

          // Exclude the current user from the progress display
          const progress = Object.entries(members)
            .filter(([id]) => id !== userId)
            .reduce((acc, [id, member]) => {
              acc[id] = member;
              return acc;
            }, {} as { [key: string]: RoomMember });

          setMembersProgress(progress);
          setLoading(false);
        } else {
          setAuthError('No room data found.');
          setLoading(false);
        }
      });

      return unsubscribe;
    } else {
      setAuthError('Please log in first.');
      setLoading(false);
    }
  }, [state, roomId, database]);

  useEffect(() => {
    const unsubscribe = fetchRoomData();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchRoomData]);

  return (
    <div className='border mb-12'>
      <h1 className="text-3xl font-bold mb-4">Others' Progress</h1>
      {authError && <p>{authError}</p>}
      {loading ? (
        <p>Loading progress...</p>
      ) :
      <div className='flex gap-8'>
        {roomSolution && Object.entries(membersProgress).map(([memberId, member]) => (
          <div key={memberId} className="border border-red-200 px-5 py-2 rounded-xl">
            <ProgressBoard board={{ grid: member.gameBoard, solution: roomSolution, actual: actualBoard }} />
            
            <h2 className="text-xl font-bold">{member.memberName || 'Unknown Member'}</h2>
          </div>
        ))}
      </div> 
      }
    </div>
  );
};

export default OthersProgress;
