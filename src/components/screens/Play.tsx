import React, { useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { useDatabase, useFirestore } from "~/lib/firebase";
import { get, ref, set, update, onValue } from "firebase/database";
import { useAuthState } from "../contexts/UserContext";
import { User } from "firebase/auth";
import Sudoku from "../game/Sudoku";
import OthersProgress from "../ui/OthersProgress";
import { createSudokuGrid } from "../game/generateBoard";
import { validateAndUpdateRoom } from "../utils/roomUtils"; // Import the function

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

const TOTAL_LIVES: number = 5;

const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAuthState();
  const database = useDatabase();
  const firestore = useFirestore();

  const [board, setBoard] = useState<Grid | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [lives, setLives] = useState<number>(TOTAL_LIVES);

  const addUserToRoom = useCallback(async (roomId: string, userId: string, photoURL: string | null, userName: string | null): Promise<void> => {
    const dbRef = ref(database, `rooms/${roomId}`);

    try {
      const roomSnapshot = await get(dbRef);

      const newMember: RoomMember = {
        memberID: userId,
        memberName: userName,
        photoURL: photoURL,
        gameBoard: [],
        remainingLives: TOTAL_LIVES,
        totalLives: TOTAL_LIVES
      };

      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val() as Room;
        const existingBoard = roomData.board;
        const currentMembers = roomData.currentMembers;

        newMember.gameBoard = existingBoard;

        if (currentMembers && currentMembers[userId]) {
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
  }, [database]);

  const updateLives = useCallback((userId: string, newLives: number) => {
    const memberRef = ref(database, `rooms/${id}/currentMembers/${userId}`);
    update(memberRef, { remainingLives: newLives }).catch(error => {
      console.error('Error updating lives:', error);
    });
  }, [database, id]);

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
  }, [database, id]);

  useEffect(() => {
    if (state.state === "SIGNED_IN" && state.currentUser) {
      setAuthError(null);
      const user = state.currentUser as User;
      const userId = user.uid;
      const userName = user.displayName;
      const photoURL = user.photoURL;

      if (id && userId) {
        validateAndUpdateRoom(id, userId, userName, photoURL)
          .then((result) => {
            setValidationMessage(result.message);
            if (result.success) {
              addUserToRoom(id, userId, photoURL, userName).then(() => {
                const roomRef = ref(database, `rooms/${id}`);

                const unsubscribe = onValue(roomRef, snapshot => {
                  if (snapshot.exists()) {
                    const roomData = snapshot.val() as Room;

                    // Check if current user is present in room data
                    const currentUser = roomData.currentMembers[userId];
                    if (currentUser) {
                      setBoard({
                        grid: currentUser.gameBoard,
                        solution: roomData.solution,
                        actual: roomData.board
                      });
                      setLives(currentUser.remainingLives);
                      console.log('Board and lives retrieved:', roomData);
                    } else {
                      console.log('No board found for this user.');
                    }
                  } else {
                    console.log('No board found for this room.');
                  }
                  setLoading(false);
                }, {
                  onlyOnce: false
                });

                return () => unsubscribe();
              }).catch(error => {
                console.error('Error adding user to room:', error);
                setLoading(false);
              });
            } else {
              setLoading(false);
            }
          }).catch((error) => {
            console.error('Error validating and updating room:', error);
            setLoading(false);
          });
      }
    } else {
      setAuthError("Please log in first.");
      setLoading(false);
    }
  }, [id, state, addUserToRoom, validateAndUpdateRoom, firestore, database]);

  const handleDecreaseLives = useCallback(() => {
    if (state.state === "SIGNED_IN" && state.currentUser) {
      const userId = state.currentUser.uid;
      if (lives > 0) {
        const newLives = lives - 1;
        setLives(newLives);
        updateLives(userId, newLives);
      }
    }
  }, [lives, state, updateLives]);

  const handleCellChange = useCallback((row: number, col: number, value: number) => {
    if (board) {
      const updatedBoard = board.grid.map(r => [...r]);
      updatedBoard[row][col] = value;
  
      setBoard(prevBoard => ({ ...prevBoard!, grid: updatedBoard }));
  
      if (state.state === "SIGNED_IN" && state.currentUser) {
        updateUserGameBoard(state.currentUser.uid, updatedBoard);
      }
    }
  }, [board, state, updateUserGameBoard]);

  if (loading) return <p>Loading board...</p>;
  if (authError) return <p>{authError}</p>;
  // if (validationMessage) return <p>{validationMessage}</p>;
  if (!board) return <p>No board found.</p>;

  return (
    <div className="flex bg-gray-900">
      <div className="w-[70%]">
        <div>
          <Sudoku 
            board={board} 
            onCellChange={handleCellChange} 
            decreaseLive={handleDecreaseLives}
            totalLives={TOTAL_LIVES}
            remainingLives={lives} // Pass the remainingLives to Sudoku
          />
          {id && <OthersProgress roomId={id} />}
        </div>
      </div>

      <div className="border ">
        Chatting Box
      </div>
    </div>
  );
};

export default Play;
