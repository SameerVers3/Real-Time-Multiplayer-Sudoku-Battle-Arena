import React, { useEffect, useState } from "react";
import Sudoku from "../game/Sudoku";
import { useParams } from 'react-router-dom';
import { useDatabase } from "~/lib/firebase";
import { get, ref, set, update } from "firebase/database";
import { createSudokuGrid } from "../game/generateBoard";
import { useAuthState } from "../contexts/UserContext";
import { User } from "firebase/auth";

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

type Grid = {
  grid: number[][];
  solution: number[][];
};

const TotalLives: number = 5; 

const database = useDatabase();

async function addUserToRoom(roomId: string, userId: string, photoURL: string | null, userName: string | null): Promise<void> {
  const dbRef = ref(database, "rooms/" + roomId);

  try {
    const roomSnapshot = await get(dbRef);

    const newMember: RoomMember = {
      memberID: userId,
      memberName: userName,
      photoURL: photoURL,
      gameBoard: [], 
      remainingLives: TotalLives,
      totalLives: TotalLives
    };

    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val() as Room;
      const existingBoard = roomData.board;

      newMember.gameBoard = existingBoard;

      const updates = {
        [`/rooms/${roomId}/currentMembers/${userId}`]: newMember
      };
      await update(ref(database), updates);
      console.log('User added to existing room successfully!');
    } else {
      const game: Grid = createSudokuGrid();

      const newRoom: Room = {
        roomID: roomId,
        board: game.grid,
        solution: game.solution,
        currentMembers: {
          [userId]: { ...newMember, gameBoard: game.grid }
        }
      };

      await set(dbRef, newRoom);
      console.log('New room created and user added successfully!');
    }
  } catch (error) {
    console.error('Error adding user to room:', error);
  }
}

const Play = () => {
  const { id } = useParams();
  const { state } = useAuthState();

  const [board, setBoard] = useState<Grid | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (state.state === "SIGNED_IN") {
      const user = state.currentUser as User;
      const userId = user.uid;
      const userName = user.displayName;
      const photoURL = user.photoURL;

      if (id && userId) {
        addUserToRoom(id, userId, photoURL, userName).then(() => {
          const roomRef = ref(database, `rooms/${id}`);
          get(roomRef).then(snapshot => {
            if (snapshot.exists()) {
              const roomData = snapshot.val() as Room;
              setBoard({
                grid: roomData.board,
                solution: roomData.solution
              });
              console.log('Board retrieved:', roomData);
            } else {
              console.log('No board found for this room.');
            }
          }).catch(error => {
            console.error('Error fetching board:', error);
          }).finally(() => {
            setLoading(false);
          });
        }).catch(error => {
          console.error('Error adding user to room:', error);
          setLoading(false);
        });
      }
    } else {
      setAuthError("Please log in first.");
      setLoading(false);
    }
  }, [id, state]);

  return (
    <>
      <p>Hello from Play</p>
      {authError && <p>{authError}</p>}
      {loading ? <p>Loading board...</p> : board ? <Sudoku board={board} /> : <p>No board found.</p>}
    </>
  );
};

export default Play;
