import React, { useState, useEffect, MouseEvent } from 'react';

type Board = {
  grid: number[][];
  solution: number[][];
  actual: number[][];
};

type SelectedBox = {
  row: number;
  column: number;
};

interface SudokuProps {
  board: Board;
  onCellChange: (row: number, col: number, value: number) => void;
  decreaseLive: () => void;
}

const options: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const Sudoku: React.FC<SudokuProps> = ({ board: initialBoard, onCellChange, decreaseLive }) => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selected, setSelected] = useState<SelectedBox | undefined>();
  const [wrong, setWrong] = useState<SelectedBox | undefined>();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const id = (event.target as HTMLElement).id;
    const [row, col] = id.split("-").map(Number);

    if (board.grid[row][col] !== 0) {
      return;
    }

    setSelected({ row, column: col });
  };

  const getCellStyle = (row: number, col: number): string => {
    let baseStyle = "w-10 h-10 flex justify-center items-center text-lg border-[0.5px] border-gray-300 ";
    
    if (board.grid[row][col] === board.solution[row][col] && board.actual[row][col] === 0) {
      baseStyle += "bg-green-200 ";
    } else if ((row === wrong?.row && col === wrong.column) && (selected?.row === row && selected?.column === col)) {
      baseStyle += "bg-blue-200 ";
    } else if (row === wrong?.row && col === wrong.column) {
      baseStyle += "bg-red-50 ";
    } else if (selected?.row === row && selected?.column === col) {
      baseStyle += "bg-blue-200 ";
    } else {
      baseStyle += "bg-white ";
    }

    if (board.grid[row][col] !== 0) {
      baseStyle += "font-bold cursor-not-allowed";
    } else {
      baseStyle += "cursor-pointer hover:bg-gray-100 ";
    }

    // Add border styles for 3x3 grid separation
    if (col % 3 === 0) baseStyle += "border-l-2 border-l-gray-400 ";
    if (row % 3 === 0) baseStyle += "border-t-2 border-t-gray-400 ";
    if (col === 8) baseStyle += "border-r-2 border-r-gray-400 ";
    if (row === 8) baseStyle += "border-b-2 border-b-gray-400 ";

    return baseStyle;
  };

  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!selected || selected.row === -1 || selected.column === -1) return;

    const i = selected.row;
    const j = selected.column;
    const id = (event.target as HTMLElement).id.split('-')[0];

    if (+id === board.solution[i][j]) {
      board.grid[i][j] = +id;
      setWrong(undefined);
      onCellChange(i, j, +id);
    } else {
      setWrong({ row: i, column: j });
      setSelected({ row: -1, column: -1 });
      decreaseLive();
      return;
    }

    setSelected({ row: -1, column: -1 });
    setBoard({ ...board });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.id.split('-')[1] === "optionBtn") return;
      if (target.id !== "board") {
        setSelected({ row: -1, column: -1 });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4 max-w-[400px] mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Sudoku</h1>
      
      <div id="board" className="flex flex-col justify-center items-center mb-4 ">
        {board.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                id={`${rowIndex}-${colIndex}`}
                onClick={handleClick}
                className={getCellStyle(rowIndex, colIndex)}
              >
                {cell !== 0 ? cell : ""}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-9 gap-1'>
        {options.map((number) => (
          <div
            key={number}
            className='border h-10 w-10 flex justify-center items-center rounded-md bg-green-50 hover:bg-green-100 cursor-pointer'
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