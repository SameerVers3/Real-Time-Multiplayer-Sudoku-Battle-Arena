import React, { useEffect, useState, useCallback } from "react";
import Sudoku from "../game/Sudoku";
import { useParams } from 'react-router-dom';
import { useDatabase } from "~/lib/firebase";
import { get, ref, set, update, onValue } from "firebase/database";
import { createSudokuGrid } from "../game/generateBoard";
import { useAuthState } from "../contexts/UserContext";
import { User } from "firebase/auth";
import OthersProgress from "../ui/OthersProgress";
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
  actual?: number[][];
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
      const currentMembers = roomData.currentMembers;

      newMember.gameBoard = existingBoard;

      if (currentMembers && currentMembers[userId]) {
        // If the user already exists, retain their existing lives
        newMember.remainingLives = currentMembers[userId].remainingLives;
        newMember.gameBoard = currentMembers[userId].gameBoard;
      }

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
  const [lives, setLives] = useState<number>(TotalLives);

  const updateLives = useCallback((userId: string, newLives: number) => {
    const memberRef = ref(database, `rooms/${id}/currentMembers/${userId}`);
    update(memberRef, { remainingLives: newLives }).catch(error => {
      console.error('Error updating lives:', error);
    });
  }, [id]);

  const updateUserGameBoard = useCallback((userId: string, newGameBoard: number[][]) => {
    if (id) {
      const memberRef = ref(database, `rooms/${id}/currentMembers/${userId}/gameBoard`);
  
      set(memberRef, newGameBoard)
        .then(() => {
          console.log('User game board updated successfully');
        })
        .catch(error => {
          console.error('Error updating user game board:', error);
        });
    }
  }, [id]);  

  useEffect(() => {
    if (state.state === "SIGNED_IN" && state.currentUser) {
      const user = state.currentUser as User;
      const userId = user.uid;
      const userName = user.displayName;
      const photoURL = user.photoURL;

      if (id && userId) {
        addUserToRoom(id, userId, photoURL, userName).then(() => {
          const roomRef = ref(database, `rooms/${id}`);

          const unsubscribe = onValue(roomRef, snapshot => {
            if (snapshot.exists()) {
              const roomData = snapshot.val() as Room;
              setBoard({
                grid: roomData.currentMembers[userId].gameBoard,
                solution: roomData.solution,
                actual: roomData.board
              });
              
              const currentUser = roomData.currentMembers[userId];
              if (currentUser) {
                setLives(currentUser.remainingLives);
              }
              console.log('Board and lives retrieved:', roomData);
            } else {
              console.log('No board found for this room.');
            }
          }, {
            onlyOnce: false
          });

          return () => unsubscribe();
        }).catch(error => {
          console.error('Error adding user to room:', error);
          setLoading(false);
        });
      }
    } else {
      setAuthError("Please log in first.");
      setLoading(false);
    }
  }, [id, state, addUserToRoom]);

  const handleDecreaseLives = () => {
    if (state.state === "SIGNED_IN") {
      const user = state.currentUser as User;
      const userId = user.uid;
      if (lives > 0) {
        const newLives = lives - 1;
        setLives(newLives);
        updateLives(userId, newLives);
      }
    }
  };

  const handleCellChange = (row: number, col: number, value: number) => {
    console.log("calling function");
    if (board) {
      // Update the local board state
      const updatedBoard = [...board.grid];
      updatedBoard[row][col] = value;
  
      setBoard({ ...board, grid: updatedBoard });
  
      if (state.state === "SIGNED_IN" && state.currentUser) {

        const user = state.currentUser as User;
        const userId = user.uid;
    
        if (userId) {
          // Update only the user's gameBoard
          updateUserGameBoard(userId, updatedBoard);
        }
      }
    }
  };
  
  
  return (
    <>
      <p>Hello from Play</p>
      {authError && <p>{authError}</p>}
      {loading ? (
        <p>Loading board...</p>
      ) : board ? (
        <>
          <Sudoku 
            board={board} 
            onCellChange={handleCellChange} 
            decreaseLive={handleDecreaseLives}
          />
          <button onClick={handleDecreaseLives}>Decrease Lives</button>
          <p>Lives remaining: {lives}</p>
          <OthersProgress roomId={id} />
        </>
      ) : (
        <p>No board found.</p>
      )}
    </>
  );
};

export default Play;
