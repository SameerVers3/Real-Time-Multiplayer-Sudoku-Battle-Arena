import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/UserContext';
import { FaHeart } from "react-icons/fa";

interface BoardDetailsProps {
  totalLives: number;
  remainingLives: number;
  board: Board;
}

type Board = {
  grid: number[][];
  solution: number[][];
  actual: number[][];
};

const BoardDetails: React.FC<BoardDetailsProps> = ({ totalLives, remainingLives, board }) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState<number>(0);

  const updateProgress = () => {
    let solableCells = 0;
    let correctCells = 0;
    let actualCount = 0;

    board.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== 0) {
          if (cell === board.solution[rowIndex][colIndex] && cell !== board.actual[rowIndex][colIndex]) {
            correctCells++;
          } else {
            actualCount++;
          }
        } else {
          solableCells++;
        }
      });
    });

    let progressPercentage = (correctCells / (81 - actualCount)) * 100;

    setProgress(Math.round(progressPercentage));
  };

  useEffect(() => {
    updateProgress();
  }, [board]);

  return (
    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="mb-4">
        <strong className="text-lg">Total Lives:</strong> {totalLives}
      </div>
      <div className="mb-4">
        <strong className="text-lg">Remaining Lives:</strong> {remainingLives}
      </div>
      <div className="flex justify-center items-center w-full mt-4">
        <div className="flex items-center w-full max-w-md">
          <progress
            className={`progress w-full h-2 mr-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
            value={progress}
            max="100"
          />
          <div className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            {progress}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
