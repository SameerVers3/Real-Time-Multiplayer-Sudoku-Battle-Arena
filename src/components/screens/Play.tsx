import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from 'react-router-dom';
import { useDatabase, useFirestore } from "~/lib/firebase";
import { get, ref, set, update, onValue, push, onChildAdded, off, remove } from "firebase/database";
import { useAuthState } from "../contexts/UserContext";
import { User } from "firebase/auth";
import Sudoku from "../game/Sudoku";
import OthersProgress from "../ui/OthersProgress";
import { createSudokuGrid } from "../game/generateBoard";
import { validateAndUpdateRoom } from "../utils/roomUtils";
import { MessageComponent } from "../ui/MessageComponent";
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import Confetti from 'react-confetti';
import RoomLobby from "../ui/RoomLobby";
import WinModal from "../ui/WinModal";
import { FirebaseError } from "firebase/app";

interface RoomMember {
  memberID: string;
  memberName: string | null;
  photoURL: string | null;
  gameBoard: number[][];
  remainingLives: number;
  totalLives: number;
}

interface Room {
  currentActive: number;
  isActive: boolean;
  creatorId: string;
  memberHistory: Record<string, any>;
  roomID: string;
  board: number[][];
  solution: number[][];
  currentMembers: { [key: string]: RoomMember };
  chat?: Message[];
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

interface GameResults {
  winner: string;
  scores: { [key: string]: number };
}

const TOTAL_LIVES: number = 5;

const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAuthState();
  const database = useDatabase();
  const firestore = useFirestore();
  
  const [roomState, setRoomState] = useState<{
    joinedBy: Array<JoinedBy>;
    maxMember: number;
    messages: Array<Message>;
    board: Grid | null;
    lives: number;
    isActive: boolean;
    isCreator: boolean;
    gameResults: GameResults | null;
  }>({
    joinedBy: [],
    maxMember: 0,
    messages: [],
    board: null,
    lives: 0,
    isActive: false,
    isCreator: false,
    gameResults: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const[gameresults, setGameResults] = useState<GameResults | null>(null);
  const [currentActive, setCurrentActive] = useState<number>(0);
  // const [gameEnded, setGameEnded] = useState<boolean>(false); // New state

  const startGame = useCallback(() => {
    if (roomState.isCreator && id) {
      const roomRef = ref(database, `rooms/${id}`);
      update(roomRef, { 
        isActive: true, 
        gameStartTime: Date.now(),
        gameEnded: false,
        currentActive: roomState.joinedBy.length
      });
      // start the timer thingy
    }
  }, [roomState.isCreator, roomState.joinedBy.length, id, database]);

  const updatePlayerCoins = async (playerId: string, coinChange: number) => {
    console.log(`Updating coins for player ${playerId} by ${coinChange}`);
    const playerRef = doc(firestore, `users/${playerId}`);
    const playerDoc = await getDoc(playerRef);
  
    if (playerDoc.exists()) {
      console.log("player Exists");
      const currentCoins = playerDoc.data()?.coin || 0;
      console.log("Current Coins: ", currentCoins);
      const newCoins = currentCoins + coinChange;
      console.log("New Coins: ", newCoins);
  
      await updateDoc(playerRef, {
        coin: newCoins
      });
    } else {
      console.error(`Player document for ${playerId} does not exist.`);
    }
  };
  

  const endGame = useCallback(async () => {
    console.log("Updating game state...");
  
    if (id) {
      const roomsCollection = collection(firestore, "Rooms");
      const roomQuery = query(roomsCollection, where("roomCode", "==", id));
  
      try {
        const querySnapshot = await getDocs(roomQuery);
        if (!querySnapshot.empty) {
          const roomDocRef = querySnapshot.docs[0].ref;
          const roomDoc = await getDoc(roomDocRef);
          const roomData = roomDoc.data();
  
          const dbRef = ref(database, `rooms/${id}`);
          const roomSnapshot = await get(dbRef);
          const realTimeRoomData = roomSnapshot.val() as Room;
        
          const members = realTimeRoomData?.currentMembers;
  
          if (!roomData?.isActive) {
            return {
              success: false,
              message: "Room Expired"
            }
          }
  
          if (members && typeof members === 'object') {
            let highestScore = -1;
            let winners: string[] = [];
            const scores: { [key: string]: number } = {};
            let activePlayers = 0;
  
            const board = realTimeRoomData.board;
  
            Object.entries(members).forEach(([memberId, memberData]: [string, any]) => {
              const gameBoard = memberData.gameBoard;
              const remainingLives = memberData.remainingLives;
              
              if (remainingLives > 0) {
                activePlayers++;
                const correctAnswers = gameBoard.flat().filter((cell: number) => cell !== 0 && !board.flat().includes(cell)).length;
                scores[memberId] = correctAnswers;
  
                if (correctAnswers > highestScore) {
                  highestScore = correctAnswers;
                  winners = [memberId];
                } else if (correctAnswers === highestScore) {
                  winners.push(memberId);
                }
              } else {
                scores[memberId] = -1; // Indicate that this player has lost
              }
            });
  
            // Update currentActive in realtime database
            await update(dbRef, { currentActive: activePlayers });
  
            // Only end the game if there's one or fewer active players
            if (activePlayers <= 1) {
              const validWinners = winners.filter(memberId => scores[memberId] !== -1);
  
              // Determine the result and apply coin adjustments
              if (validWinners.length > 1) {
                console.log("The game is a tie. No coin adjustments are made.");
              } else if (validWinners.length === 1) {
                const winner = validWinners[0];
                const losers = Object.keys(members).filter(memberId => memberId !== winner);
  
                // Increase coins for the winner
                await updatePlayerCoins(winner, 5);
  
                // Decrease coins for losers
                await Promise.all(losers.map(loser => updatePlayerCoins(loser, -5)));
  
                // Transfer coins from losers to the winner
                const totalLoss = losers.length * 5;
                await updatePlayerCoins(winner, totalLoss);
              }
  
              const winner = validWinners.length === 1 ? validWinners[0] : 'Tie';
              setRoomState(prev => ({ ...prev, gameResults: { winner, scores }, lives: 0 }));
  
              await updateDoc(roomDocRef, {
                isActive: false,
                gameEnded: true,
                gameResults: { winner, scores }
              });
  
              // Update realtime database
              await update(dbRef, {
                isActive: false,
                gameEnded: true,
                gameResults: { winner, scores }
              });
  
              // Notify all players about game end
              const chatRef = ref(database, `rooms/${id}/chat`);
              await push(chatRef, {
                message: `Game ended. ${winner === 'Tie' ? 'It\'s a tie!' : `${members[winner].memberName} wins!`}`,
                messageType: "notification",
                time: new Date().toISOString(),
                senderID: "system"
              });
  
              console.log("Game ended successfully");
            } else {
              // Update scores without ending the game
              await updateDoc(roomDocRef, {
                currentScores: scores
              });
  
              // Update realtime database
              await update(dbRef, {
                currentScores: scores
              });
  
              console.log("Scores updated, game continues");
            }
          } else {
            console.error("Current members data is missing or not an object.");
          }
        } else {
          console.error(`No document found with roomCode ${id} in Firestore.`);
        }
      } catch (error) {
        if (error instanceof FirebaseError) {
          console.error("FirebaseError occurred:", error.code, error.message);
        } else {
          console.error("Unexpected error occurred:", error);
        }
      }
    }
  }, [id, database, firestore, updatePlayerCoins]);

  const handleDecreaseLives = useCallback(() => {
    if (state.state === "SIGNED_IN" && state.currentUser && roomState.lives > 0) {
      const newLives = roomState.lives - 1;
      setRoomState(prev => ({ ...prev, lives: newLives }));
      if (newLives === 0) {
        // Player has lost, update their score to -1
        const dbRef = ref(database, `rooms/${id}/currentMembers/${state.currentUser.uid}`);
        
        update(dbRef, { score: -1, isLost: true });

        // If more than two players, update loser status
        if (roomState.joinedBy.length > 2) {
          update(dbRef, { isLost: true });
        }
        
        // If only two players left, end the game
        if (currentActive <= 2) {
          endGame();
        } else {
          // Decrease currentActive count
          const roomRef = ref(database, `rooms/${id}`);
          get(roomRef).then((snapshot) => {
            const currentActiveCount = snapshot.val().currentActive || 0;
            update(roomRef, { currentActive: currentActiveCount - 1 });
          });
        }
      }
      updateLives(state.currentUser.uid, newLives);
    }
  }, [roomState.lives, roomState.joinedBy.length, currentActive, state, endGame, id, database]);

  const addUserToRoom = useCallback(async (roomId: string, userId: string, photoURL: string | null, userName: string | null): Promise<void> => {
    const dbRef = ref(database, `rooms/${roomId}`);
    
    const roomsCollection = collection(firestore, "Rooms");
    const roomsQuery = query(roomsCollection, where("roomCode", "==", roomId));
    const querySnapshot = await getDocs(roomsQuery);
    const roomDocRef = querySnapshot.docs[0].ref;
    const roomDoc = await getDoc(roomDocRef);
    const roomData = roomDoc.data();

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
        const memberHistory: { [key: string]: any } = roomData.memberHistory || {};
  
        if (!roomData.creatorId) {
          await update(dbRef, { creatorId: userId });
          setRoomState(prev => ({ ...prev, isCreator: true }));
        } else {
          setRoomState(prev => ({ ...prev, isCreator: roomData.creatorId === userId }));
        }

        if (memberHistory && memberHistory[userId]) {
          newMember.gameBoard = existingBoard;
          newMember.remainingLives = memberHistory[userId].remainingLives;
          newMember.gameBoard = memberHistory[userId].gameBoard;
  
          const updates = {
            [`/rooms/${roomId}/currentMembers/${userId}`]: newMember,
            [`/rooms/${roomId}/memberHistory/${userId}`]: null
          };
  
          await update(ref(database), updates);
        } else {
          newMember.gameBoard = existingBoard;
  
          const updates = {
            [`/rooms/${roomId}/currentMembers/${userId}`]: newMember
          };
  
          await update(ref(database), updates);
        }
  
        const updatedJoinedBy = Object.values(roomData.currentMembers).map((member: RoomMember) => ({
          userID: member.memberID,
          userName: member.memberName,
          photoURL: member.photoURL,
        }));
        setRoomState(prev => ({ ...prev, joinedBy: updatedJoinedBy }));
  
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
          memberHistory: {},
          chat: [],
          creatorId: userId,
          isActive: false,
          currentActive: 0
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
  }, [database, firestore]);

  useEffect(() => {
    if (roomState.isActive && roomState.joinedBy.length === 1 && state.state === "SIGNED_IN" && state.currentUser) {
      const singlePlayerWin = async () => {
        const roomRef = ref(database, `rooms/${id}`);
        await update(roomRef, {
          isActive: false,
          gameEnded: true,
          gameResults: {
            winner: state.currentUser.uid,
            scores: { [state.currentUser.uid]: 1 }
          }
        });
        setRoomState(prev => ({
          ...prev,
          gameResults: {
            winner: state.currentUser.uid,
            scores: { [state.currentUser.uid]: 1 }
          }
        }));
      };
      singlePlayerWin();
    }
  }, [roomState.isActive, roomState.joinedBy, state, id, database]);

  const updateLives = useCallback((userId: string, newLives: number) => {
    const memberRef = ref(database, `rooms/${id}/currentMembers/${userId}`);
    update(memberRef, { remainingLives: newLives }).catch(error => {
      console.error('Error updating lives:', error);
    });
  }, [database, id]);

  const updateUserGameBoard = useCallback((userId: string, newGameBoard: number[][]) => {
    if (id) {
      const memberRef = ref(database, `rooms/${id}/currentMembers/${userId}/gameBoard`);
      set(memberRef, newGameBoard).catch(error => {
        console.error('Error updating user game board:', error);
      });
    }
  }, [database, id]);

  const listenForMessages = useCallback(() => {
    if (id) {
      const chatRef = ref(database, `rooms/${id}/chat`);
      const handleNewMessage = (snapshot: any) => {
        const newMessage = snapshot.val();
        setRoomState(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
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
        const validationResult = await validateAndUpdateRoom(id, userId, userName, photoURL, (maxMember) => {
          if (maxMember !== undefined) {
            setRoomState(prev => ({ ...prev, maxMember }));
          }
        });
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
            setCurrentActive(roomData.currentActive || 0);
            setRoomState(prev => ({
              ...prev,
              isActive: Boolean(roomData.isActive),
              board: roomData.currentMembers[userId] ? {
                grid: roomData.currentMembers[userId].gameBoard,
                solution: roomData.solution,
                actual: roomData.board
              } : null,
              lives: roomData.currentMembers[userId]?.remainingLives || TOTAL_LIVES,
              joinedBy: Object.values(roomData.currentMembers).map((member: RoomMember) => ({
                userID: member.memberID,
                userName: member.memberName,
                photoURL: member.photoURL,
              }))
            }));
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

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [id, state, addUserToRoom, database]);

  useEffect(() => {
    if (state.state === "SIGNED_IN" && state.currentUser) {
      return listenForMessages();
    }
  }, [state, listenForMessages]);

  const handleCellChange = useCallback((row: number, col: number, value: number) => {
    if (roomState.board && state.state === "SIGNED_IN" && state.currentUser) {
      const updatedBoard = roomState.board.grid.map(r => [...r]);
      updatedBoard[row][col] = value;
      setRoomState(prev => ({
        ...prev,
        board: { ...prev.board!, grid: updatedBoard }
      }));
      updateUserGameBoard(state.currentUser.uid, updatedBoard);
    }
  }, [roomState.board, state, updateUserGameBoard]);

  const handleGameWin = useCallback(() => {
    setShowConfetti(true);
    endGame();
    setTimeout(() => setShowConfetti(false), 15000);
  }, [endGame]);

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (id && state.state === "SIGNED_IN" && state.currentUser) {
      const userId = state.currentUser.uid;
      const userName = state.currentUser.displayName || 'Unknown user';
      
      event.preventDefault();
      event.returnValue = '';
  
      const cleanupRoom = async () => {
        try {
          const roomRef = ref(database, `rooms/${id}`);
          const roomData = (await get(roomRef)).val() as Room;
  
          if (roomData.currentMembers && roomData.currentMembers[userId]) {
            // Decrease currentActive count
            const currentActiveCount = roomData.currentActive || 0;
            await update(roomRef, { currentActive: currentActiveCount - 1 });

            const chatRef = ref(database, `rooms/${id}/chat`);
            await push(chatRef, {
              message: `${userName} left the room`,
              messageType: "notification",
              time: new Date().toISOString(),
              senderID: "system"
            });

            // If only one player left, end the game
            if (currentActiveCount - 1 <= 1) {
              endGame();
            }
          }
        } catch (error) {
          console.error('Failed to handle before unload:', error);
        }
      };
  
      cleanupRoom();
    }
  }, [id, state, database, endGame]);

  useEffect(() => {
    const roomsCollection = collection(firestore, "Rooms");
    const roomDocRef = query(roomsCollection, where("roomCode", "==", id));
  
    const unsubscribe = onSnapshot(roomDocRef, (snapshot) => {
      console.log("Current data: ", snapshot.docs[0].data());
      if (!snapshot.empty) {
        const doc = snapshot.docs[0].data(); // Assuming you expect only one document
        console.log(doc);
          console.log("hehe")
          if (doc.isActive === false) {
            console.log("updated");
            setShowScoreModal(true);
            const element = document.getElementById("win-room-modal") as HTMLDialogElement;
            element?.showModal();
            console.log(doc.gameResults);
            setGameResults(doc.gameResults);
            console.log(state.currentUser.uid);
            if ((gameresults?.winner ==   state.currentUser.uid)) {
              console.log("You won");
            }
            else {
              alert("You lost");
              console.log("You lost");
            }
          }
      }
    }, (error) => {
      console.error("Error fetching document: ", error);
    });
  
    return () => {
      unsubscribe();
    };
  }, [firestore, id]);  
  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  const memoizedSudoku = useMemo(() => (
    <Sudoku 
      board={roomState.board!} 
      onCellChange={handleCellChange} 
      decreaseLive={handleDecreaseLives} 
      totalLives={TOTAL_LIVES}
      remainingLives={roomState.lives}
      roomId={id!}
      maxMembers={roomState.maxMember}
      joinedBy={roomState.joinedBy}
      time={"10:00"}
      onWin={handleGameWin}
      onGameEnd={endGame}
      deactive={roomState.lives === 0}
    />
  ), [roomState.board, handleCellChange, handleDecreaseLives, roomState.lives, id, roomState.maxMember, roomState.joinedBy, handleGameWin, endGame]);

  const memoizedOthersProgress = useMemo(() => (
    id && <OthersProgress roomId={id} />
  ), [id]);

  const memoizedMessageComponent = useMemo(() => (
    <MessageComponent
      messages={roomState.messages}
      joinedBy={roomState.joinedBy}
      onSendMessage={sendMessage}
      userId={state.state === "SIGNED_IN" ? state.currentUser?.uid : null}
    />
  ), [roomState.messages, roomState.joinedBy, sendMessage, state]);

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-900"><div className="text-white text-2xl">Loading game...</div></div>;
  if (error) return <div className="flex items-center justify-center h-screen bg-gray-900"><div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">{error}</div></div>;
  if (!roomState.isActive && !roomState.gameResults) return <div className="flex items-center justify-center h-screen "><RoomLobby roomId={id!} maxMembers={roomState.maxMember} onStartGame={startGame} /></div>;
  if (!roomState.board) return <div className="flex items-center justify-center h-screen bg-gray-900"><div className="text-white text-2xl">No game board found.</div></div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="w-full md:w-3/4 sm:p-4 mx-auto">
        <div className="flex flex-col rounded-lg p-2 sm:p-4">
          {memoizedSudoku}
          {memoizedOthersProgress}
        </div>
      </div>
      <div className="">
        <div className="p-4 w-full md:w-3/4 mx-auto md:mb-16">
          <div className="rounded-lg shadow-lg h-full">
            {memoizedMessageComponent}
          </div>
        </div>
      </div>
      {showConfetti && <Confetti />}
      {showScoreModal && <WinModal isWinner={true} coin={5}/>}
    </div>
  );
};

export default Play;