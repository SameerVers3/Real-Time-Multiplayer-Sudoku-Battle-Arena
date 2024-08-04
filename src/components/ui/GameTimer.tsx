import React, { useState, useEffect, useCallback } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { useDatabase } from '~/lib/firebase';
import { useAuthState } from '../contexts/UserContext';

interface GameTimerProps {
  roomId: string;
  onGameEnd: () => void;
}

const GAME_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

const GameTimer: React.FC<GameTimerProps> = ({ roomId, onGameEnd }) => {
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const database = useDatabase();
  const { state } = useAuthState();

  const endGame = useCallback(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    update(roomRef, { isActive: false, gameEnded: true }).then(() => {
      onGameEnd();
    });
  }, [database, roomId, onGameEnd]);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomId}`);
    let timerInterval: NodeJS.Timeout;

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        if (roomData.gameStartTime && !roomData.gameEnded) {
          const now = Date.now();
          const elapsed = now - roomData.gameStartTime;
          const remaining = Math.max(0, GAME_DURATION - elapsed);

          setTimeRemaining(remaining);

          if (remaining > 0) {
            timerInterval = setInterval(() => {
              setTimeRemaining((prev) => {
                const newTime = Math.max(0, prev - 1000);
                if (newTime === 0) {
                  clearInterval(timerInterval);
                  endGame();
                }
                return newTime;
              });
            }, 1000);
          } else {
            endGame();
          }
        }
      }
    }, { onlyOnce: true }); // Only listen once for the initial game start

    return () => {
      unsubscribe();
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [database, roomId, endGame]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {formatTime(timeRemaining)}
    </>
  );
};

export default GameTimer;