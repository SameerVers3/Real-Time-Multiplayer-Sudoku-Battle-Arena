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
    <div className={`p-3 m-2 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>

      <div className='flex justify-center items-center gap-5'>
        <div className='flex border'>
          <div className="font-bold text-lg">
            <span className={`text-3xl ${remainingLives == 0 && "text-red-500"}`}>{remainingLives}</span>
              / {totalLives}
          </div>
        </div>

        <div className="flex items-center mt-2 gap-1">
          {[...Array(totalLives)].map((_, index) => (
            <FaHeart
              key={index}
              className={`text-2xl ${index < remainingLives ? 'text-red-500' : theme == "dark" ? "text-gray-700" : 'text-gray-300'}`}
              />
            ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="w-full max-w-md">
          <progress
            className={`progress w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}
            value={progress}
            max="100"
          />
        </div>
        <div className={`ml-2 font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
