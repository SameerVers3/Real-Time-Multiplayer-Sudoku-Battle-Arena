import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { createSudokuGrid } from "./generateBoard";

type Board = {
  grid: number[][];
  solution: number[][];
};

type NumberOptions = number[];

type SelectedBox = {
  row: number;
  column: number;
};

interface SudokuProps {
  board: Board;
}

const options: NumberOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const Sudoku: React.FC<SudokuProps> = ({ board: initialBoard }) => {
  console.log(initialBoard)
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selected, setSelected] = useState<SelectedBox | undefined>();
  const [wrong, setWrong] = useState<SelectedBox | undefined>();
  const sudokuRef = useRef<HTMLDivElement>(null);

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

    if (board.grid[row][col] !== 0) {
      return;
    }

    setSelected({ row, column: col });
  };

  const isSelected = (row: number, col: number) => {
    if ((row === wrong?.row && col === wrong.column) && (selected?.row === row && selected?.column === col)) {
      return "border-blue-200 bg-blue-200";
    }

    if (row === wrong?.row && col === wrong.column) {
      return "border border-red-200 bg-red-50";
    }
    return selected?.row === row && selected?.column === col ? "border-blue-200 bg-blue-200" : "border border-gray-300 bg-gray-100";
  };

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!selected) return;
    if (selected.row === -1 || selected.column === -1) return;
    const i = selected.row;
    const j = selected.column;

    const id = (event.target as HTMLElement).id.split('-')[0];

    if (+id === board.solution[i][j]) {
      board.grid[i][j] = +id;
      setWrong(undefined);
    } else {
      setWrong({ row: i, column: j });
      setSelected({ row: -1, column: -1 });
      return;
    }

    setSelected({ row: -1, column: -1 });
    setBoard({ ...board }); // Trigger re-render with updated board
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent<HTMLElement>) => {
      if ((event.target as HTMLElement).id.split('-')[1] === "optionBtn") return;
      if ((event.target as HTMLElement).id !== "board") {
        setSelected({ row: -1, column: -1 });
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
        {board.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              id={`${rowIndex}-${colIndex}`}
              onClick={handleClick}
              className={`w-12 h-12 flex justify-center items-center text-lg rounded-lg ${cell ? "cursor-not-allowed" : "cursor-pointer"} ${isSelected(rowIndex, colIndex)}`}
            >
              {cell ? cell : ""}
            </div>
          ))
        )}
      </div>

      <div className='flex flex-row gap-1'>
        {options.map((number) => (
          <div
            key={number}
            className='border h-12 w-12 flex justify-center items-center rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer'
            id={`${number}-optionBtn`}
            onClick={handleOptionsClick}
          >
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sudoku;
