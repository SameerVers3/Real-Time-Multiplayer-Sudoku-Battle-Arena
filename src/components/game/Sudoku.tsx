import React, { useState, useRef, ChangeEvent, useEffect } from 'react';

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

type  SelectedBox = {
  row?: Number;
  column?: Number
}

const Sudoku: React.FC = () => {

  const [board, setBoard] = useState<Board>(generateBoard());
  const [selected, setSelected] = useState<SelectedBox>();
  const sudokuRef = useRef<HTMLDivElement>(null);

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const id = (event.target as HTMLElement).id;
    const [row, col] = id.split("-").map(Number);

    if (board[row][col] !== 0) {
      return;
    }

    setSelected({
      row,
      column: col
    });
  };

  const isSelected = (row: number, col: number) => {
    return selected?.row === row && selected?.column === col ? "border-blue-200 bg-blue-200" : "";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).id !== "board") {
        setSelected({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 w-[530px] h-[530px]">
      <h1 className="text-3xl font-bold mb-4">Sudoku</h1>
      <div id="board" className="grid grid-cols-9 gap-1 border p-2">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return <div
              key={`${rowIndex}-${colIndex}`}
              id={`${rowIndex}-${colIndex}`}
              onChange={handleInputChange(rowIndex, colIndex)}
              onKeyDown={handleKeyDown}  // Handle key down events
              onClick={handleClick}
              className={`w-12 h-12 flex justify-center items-center text-lg border border-gray-300 rounded-lg bg-gray-100 ${cell ? "cursor-not-allowed" : "cursor-pointer"} ${isSelected(rowIndex, colIndex)}`}
            >
              {cell ? cell : ""}
            </div>
          })
        )}
      </div>
    </div>
  );
};

export default Sudoku;
