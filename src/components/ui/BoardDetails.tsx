import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/UserContext';
import { FaHeart } from "react-icons/fa";

interface BoardDetailsProps {
  totalLives: number;
  remainingLives: number;
  board: Board;
  phone: boolean;
  progress: number;
  setProgress: (progress: number) => void;
}

type Board = {
  grid: number[][];
  solution: number[][];
  actual?: number[][];
};

const BoardDetails: React.FC<BoardDetailsProps> = ({ totalLives, remainingLives, board, phone, progress, setProgress }) => {
  const { theme } = useTheme();

  const updateProgress = () => {
    let solableCells = 0;
    let correctCells = 0;
    let actualCount = 0;

    board.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== 0) {
          if (cell === board.solution[rowIndex][colIndex] && board.actual && cell !== board.actual[rowIndex][colIndex]) {
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
    <div className={`px-3 p-1 sm:p-3 m-2 rounded-lg  ${phone ? '' : `${theme === 'dark' ? 'text-gray-100 bg-gray-800 bg-gray-800' : 'text-gray-900 bg-gray-100'}`}`}>

      <div className='flex justify-center items-center gap-5'>
        <div className='flex'>
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
