import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/UserContext';

interface ProgressBoardProps {
  board: {
    grid: number[][];
    solution: number[][];
    actual: number[][];
    name: string;
    lives: number;
    totalLives: number;
    photoURL: string;
  };
}

const ProgressBoard: React.FC<ProgressBoardProps> = ({ board }) => {
  const [progress, setProgress] = useState<number>(0);
  const { theme } = useTheme();

  const isFilled = (row: number, col: number): string => {
    if (board.grid[row][col] === board.actual[row][col] && board.grid[row][col] !== 0) {
      return theme === 'light' ? 'bg-blue-300' : 'bg-blue-900';
    }
    if (board.grid[row][col] === board.solution[row][col]) {
      return theme === 'light' ? 'bg-green-300' : 'bg-green-800';
    }
    return theme === 'light' ? 'bg-white' : 'bg-gray-900';
  };

  const renderCell = (rowIndex: number, cellIndex: number) => (
    <div
      key={`${rowIndex}-${cellIndex}`}
      className={`w-4 h-4 flex justify-center items-center text-xs font-medium ${isFilled(rowIndex, cellIndex)} rounded-md`}
    >
      {/* {board.grid[rowIndex][cellIndex] !== 0 && board.grid[rowIndex][cellIndex]} */}
    </div>
  );

  const renderSubgrid = (startRow: number, startCol: number) => (
    <div className={`grid grid-rows-3 grid-cols-3 gap-[1px] p-[0.5px] ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800'}`}>
      {[0, 1, 2].map(row => 
        [0, 1, 2].map(col => renderCell(startRow + row, startCol + col))
      )}
    </div>
  );

  const updateProgress = () => {
    let solableCells = 0;
    let correctCells = 0;
    let actualCount = 0;
  
    board.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== 0) {
          if (cell === board.solution[rowIndex][colIndex] && cell !== board.actual[rowIndex][colIndex]) {
            correctCells++;
          }
          else {
            actualCount++;
          }
        }
        else {
          solableCells++;
        }
      });
    });
  
    let progressPercentage = correctCells / (81 - actualCount) * 100; 
  
    setProgress(Math.round(progressPercentage));
  };

  useEffect(() => {
    updateProgress();
  }, [board]);

  const trimString = (str: string) => {
    if (str.length > 15) {
      return `${str.slice(0, 13)}...`;
    }
    return str;
  };

  return (
    <div className={`relative p-2 max-w-[400px] mx-auto rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {board.lives === 0 && (
        <div className="absolute inset-0 flex justify-center items-center">
          <svg
            className="w-24 h-24 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
      <div className="relative">
        <div className={`grid grid-rows-3 grid-cols-3 gap-1 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {[0, 3, 6].map(row => 
            [0, 3, 6].map(col => (
              <React.Fragment key={`subgrid-${row}-${col}`}>
                {renderSubgrid(row, col)}
              </React.Fragment>
            ))
          )}
        </div>
        {board.lives === 0 && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <svg
              className="w-56 h-56 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
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
      
      <div className='flex flex-col justify-center gap-1'>
        <div className="flex justify-between align-center w-full">
          <div className="avatar">
            <div className="w-8 h-8 rounded-full">
              <img src={board.photoURL} alt="Avatar" />
            </div>
          </div>
          <div className="font-bold text-lg">
            <span className={`text-3xl ${board.lives == 0 && "text-red-500"}`}>{board.lives}</span>
              / {board.totalLives}
          </div>
        </div>
        <h2 className="text-xl font-bold max-w-1 text-gray-500">{trimString(board.name) || 'Unknown Member'}</h2>
      </div>
    </div>
  );
};

export default ProgressBoard;
