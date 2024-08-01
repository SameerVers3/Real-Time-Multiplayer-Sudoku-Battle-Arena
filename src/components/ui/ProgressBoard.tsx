import React, { useEffect, useState } from 'react';

interface ProgressBoardProps {
  board: {
    grid: number[][];
    solution: number[][];
    actual: number[][];
  };
}

const ProgressBoard: React.FC<ProgressBoardProps> = ({ board }) => {

  const [progress, setProgress] = useState<number>(0);

  const isFilled = (row: number, col: number): string => {
    if (board.grid[row][col] === board.actual[row][col] && board.grid[row][col] !== 0) {
      return "bg-blue-200";
    }
    if (board.grid[row][col] === board.solution[row][col]) {
      return "bg-green-200";
    }
    return "bg-white";
  };

  const renderCell = (rowIndex: number, cellIndex: number) => (
    <div
      key={`${rowIndex}-${cellIndex}`}
      className={`w-5 h-5 flex justify-center items-center text-[6px] font-medium ${isFilled(rowIndex, cellIndex)}`}
    >
      {board.grid[rowIndex][cellIndex] !== 0 ? board.grid[rowIndex][cellIndex] : ''}
    </div>
  );

  const renderSubgrid = (startRow: number, startCol: number) => (
    <div className="grid grid-rows-3 grid-cols-3 gap-[0.5px] bg-gray-300">
      {[0, 1, 2].map(row => 
        [0, 1, 2].map(col => renderCell(startRow + row, startCol + col))
      )}
    </div>
  );

  const updateProgress = () => {
    let totalCells = 0;
    let correctCells = 0;
  
    board.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== 0) {
          totalCells++;
          if (cell === board.solution[rowIndex][colIndex]) {
            correctCells++;
          }
        }
      });
    });
  
    // Calculate progress as a percentage
    const progressPercentage = totalCells > 0 ? (correctCells / totalCells) * 100 : 0;
    // setInterval(() => {
    //   console.log(progress)
    // }, 1000)
    // Update the progress state
    setProgress(progressPercentage);
  };
  

  useEffect(() => {
    updateProgress();
  }, [board])

  return (

      <div className="flex flex-col gap-8">
        <h3 className="text-sm font-bold mb-1">Current Progress</h3>
        <div className="grid grid-rows-3 grid-cols-3 gap-[0.5px] p-[0.5px] bg-gray-400">
          {[0, 3, 6].map(row => 
            [0, 3, 6].map(col => (
              <React.Fragment key={`subgrid-${row}-${col}`}>
                {renderSubgrid(row, col)}
              </React.Fragment>
            ))
          )}
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="flex items-center w-full max-w-md">
            <progress
              className="progress progress-primary w-full h-3 mr-1"
              value={progress}
              max="100"
            ></progress>
            <div className="">
              {progress}%
            </div>
          </div>
        </div>

      </div>
  );
};

export default ProgressBoard;