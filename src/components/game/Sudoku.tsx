import React, { useState, ChangeEvent } from 'react';

// Define the type for the Sudoku board
type Board = number[][];

// Generate a static Sudoku board for demonstration
const generateBoard = (): Board => {
  return [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
};

const Sudoku: React.FC = () => {
  const [board, setBoard] = useState<Board>(generateBoard());

  // Handle changes in input fields
  const handleChange = (row: number, col: number, value: string) => {
    const newBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? parseInt(value) || 0 : cell))
    );
    setBoard(newBoard);
  };

  // Handle change event for input fields
  const handleInputChange = (row: number, col: number) => (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(row, col, event.target.value);
  };

  // Prevent default behavior for arrow keys and other unwanted inputs
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
    }
  };

  return (
    <div className="p-4 w-[530px] h-[530px]">
      <h1 className="text-3xl font-bold mb-4">Sudoku</h1>
      <div className="grid grid-cols-9 gap-1 border p-2">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"  // Use type="text" to prevent arrow key changes
              maxLength={1} // Limit input length to one character
              value={cell || ''}
              onChange={handleInputChange(rowIndex, colIndex)}
              onKeyDown={handleKeyDown}  // Handle key down events
              disabled={cell !== 0}  // Disable input for already filled cells
              className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Sudoku;
