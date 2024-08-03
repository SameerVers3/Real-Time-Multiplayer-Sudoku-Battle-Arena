import React, { useEffect, useState, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { useDatabase, useFirestore } from "~/lib/firebase";
import { get, ref, set, update, onValue, push, onChildAdded, off} from "firebase/database";
import { useAuthState } from "../contexts/UserContext";
import { User } from "firebase/auth";
import Sudoku from "../game/Sudoku";
import OthersProgress from "../ui/OthersProgress";
import { createSudokuGrid } from "../game/generateBoard";
import { validateAndUpdateRoom } from "../utils/roomUtils";
import { MessageComponent } from "../ui/MessageComponent";
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
  chat?: {
    message: string;
    messageType: "message" | "notification";
    time: string;
    senderID: string;
  }[];
}


type Grid = {
  grid: number[][];
  solution: number[][];
  actual?: number[][];
};

type JoinedBy = {
  userID: string;
  userName: string | null;
  photoURL: string | null;
}

interface Message {
  message: string;
  messageType: "message" | "notification";
  time: string;
  senderID: string;
}


const TOTAL_LIVES: number = 5;

const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAuthState();
  const database = useDatabase();
  const firestore = useFirestore();
  const [joinedBy, setJoinedBy] = useState<Array<JoinedBy>>([]);
  const [messages, setMessages] = useState<Array<Message>>([]);
  
  const [board, setBoard] = useState<Grid | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
  
        // Update the list of users in the room
        const updatedJoinedBy = Object.values(roomData.currentMembers).map((member: RoomMember) => ({
          userID: member.memberID,
          userName: member.memberName,
          photoURL: member.photoURL,
        }));
        setJoinedBy(updatedJoinedBy);
  
        // Send a notification message
        const chatRef = ref(database, `rooms/${roomId}/chat`);
        const notificationMessage = {
          message: `${userName} joined the room`,
          messageType: "notification",
          time: new Date().toISOString(),
          senderID: "system"
        };
  
        await push(chatRef, notificationMessage);
  
        console.log('User added to existing room and notification sent successfully!');
      } else {
        const game: Grid = createSudokuGrid();
  
        const newRoom: Room = {
          roomID: roomId,
          board: game.grid,
          solution: game.solution,
          currentMembers: {
            [userId]: { ...newMember, gameBoard: game.grid }
          },
          chat: []
        };
  
        await set(dbRef, newRoom);
  
        const chatRef = ref(database, `rooms/${roomId}/chat`);
        const notificationMessage = {
          message: `${userName} joined the room`,
          messageType: "notification",
          time: new Date().toISOString(),
          senderID: "system"
        };
  
        await push(chatRef, notificationMessage);
  
        console.log('New room created and user added with notification sent successfully!');
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

  const listenForMessages = useCallback(() => {
    if (id) {
      const chatRef = ref(database, `rooms/${id}/chat`);
  
      const handleNewMessage = (snapshot: any) => {
        const newMessage = snapshot.val();
        setMessages(prevMessages => [...prevMessages, newMessage]);
      };
  
      onChildAdded(chatRef, handleNewMessage);
  
      return () => off(chatRef, "child_added", handleNewMessage);
    }
  }, [id, database]);

  const sendMessage = useCallback(async (message: string) => {
    if (id && state.state === "SIGNED_IN" && state.currentUser) {
      const chatRef = ref(database, `rooms/${id}/chat`);
      const newMessageObj = {
        message: message,
        messageType: "message",
        time: new Date().toISOString(),
        senderID: state.currentUser.uid
      };
  
      await push(chatRef, newMessageObj);
    }
  }, [id, state, database]);

  useEffect(() => {
    const initializeRoom = async () => {
      if (state.state !== "SIGNED_IN" || !state.currentUser) {
        setError("Please log in to join the game.");
        setLoading(false);
        return;
      } else {
        setError(null);
      }

      const user = state.currentUser as User;
      const userId = user.uid;
      const userName = user.displayName;
      const photoURL = user.photoURL;

      if (!id) {
        setError("Invalid room ID.");
        setLoading(false);
        return;
      }

      try {
        const validationResult = await validateAndUpdateRoom(id, userId, userName, photoURL);
        if (!validationResult.success) {
          setError(validationResult.message);
          setLoading(false);
          return;
        }

        await addUserToRoom(id, userId, photoURL, userName);

        const roomRef = ref(database, `rooms/${id}`);
        const unsubscribe = onValue(roomRef, snapshot => {
          if (snapshot.exists()) {
            const roomData = snapshot.val() as Room;
            const currentUser = roomData.currentMembers[userId];
            if (currentUser) {
              setBoard({
                grid: currentUser.gameBoard,
                solution: roomData.solution,
                actual: roomData.board
              });
              setLives(currentUser.remainingLives);

              const updatedJoinedBy = Object.values(roomData.currentMembers).map((member: RoomMember) => ({
                userID: member.memberID,
                userName: member.memberName,
                photoURL: member.photoURL,
              }));
              setJoinedBy(updatedJoinedBy);
            } else {
              setError("User not found in the room.");
            }
          } else {
            setError("Room not found.");
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing room:', error);
        setError("An error occurred while joining the room.");
        setLoading(false);
      }
    };

    initializeRoom();
  }, [id, state, addUserToRoom, database]);

  useEffect(() => {
    if (state.state === "SIGNED_IN" && state.currentUser) {
      return listenForMessages();
    }
  }, [state, listenForMessages]);

  const handleDecreaseLives = useCallback(() => {
    if (state.state === "SIGNED_IN" && state.currentUser && lives > 0) {
      const newLives = lives - 1;
      setLives(newLives);
      updateLives(state.currentUser.uid, newLives);
    }
  }, [lives, state, updateLives]);

  const handleCellChange = useCallback((row: number, col: number, value: number) => {
    if (board && state.state === "SIGNED_IN" && state.currentUser) {
      const updatedBoard = board.grid.map(r => [...r]);
      updatedBoard[row][col] = value;
      setBoard(prevBoard => ({ ...prevBoard!, grid: updatedBoard }));
      updateUserGameBoard(state.currentUser.uid, updatedBoard);
    }
  }, [board, state, updateUserGameBoard]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-2xl">Loading game...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
        {error}
      </div>
    </div>
  );

  if (!board) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-2xl">No game board found.</div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-3/4 p-4">
        <div className="flex flex-col rounded-lg shadow-lg p-4">
          <Sudoku 
            board={board} 
            onCellChange={handleCellChange} 
            decreaseLive={handleDecreaseLives}
            totalLives={TOTAL_LIVES}
            remainingLives={lives}
          />
          {id && <OthersProgress roomId={id} />}
        </div>
      </div>

      <div className="w-full md:w-1/4 p-4">
        <div className=" rounded-lg shadow-lg h-full">
          <MessageComponent
            messages={messages}
            joinedBy={joinedBy}
            onSendMessage={sendMessage}
            userId={state.state === "SIGNED_IN" ? state.currentUser?.uid : null}
          />
        </div>
      </div>
    </div>
  );
};

export default Play;