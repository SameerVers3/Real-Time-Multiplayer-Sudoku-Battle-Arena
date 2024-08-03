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
    <div className='mb-12 mx-16 flex justify-center'>
      {authError && <p>{authError}</p>}
      {loading ? (
        <p>Loading progress...</p>
      ) :
      <div className='flex gap-8'>
        {roomSolution && Object.entries(membersProgress).map(([memberId, member]) => (
          <div key={memberId} className="border border-gray-800 px-3 py-1 rounded-xl">
            <ProgressBoard board={{ grid: member.gameBoard, solution: roomSolution, actual: actualBoard, name: member.memberName, lives: member.remainingLives, totalLives: member.totalLives, photoURL: member.photoURL }} />
          </div>
        ))}
      </div> 
      }
    </div>
  );
};

export default OthersProgress;
