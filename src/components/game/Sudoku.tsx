import React, { useState, useEffect, MouseEvent, CSSProperties, KeyboardEvent } from 'react';
import { useTheme } from '../contexts/UserContext';
import OptionGrid from '../ui/OptionGrid';
import BoardDetails from '../ui/BoardDetails';
import RoomId from '../ui/RoomId';
import RoomDetails from '../ui/RoomDetails';

type Board = {
  grid: number[][];
  solution: number[][];
  actual?: number[][];
};

type SelectedBox = {
  row: number;
  column: number;
};

interface SudokuProps {
  board: Board;
  onCellChange: (row: number, col: number, value: number) => void;
  decreaseLive: () => void;
  totalLives: number;
  remainingLives: number;
  roomId: string | undefined;
  maxMembers: number;
  joinedBy: { userID: string; userName: string | null; photoURL: string | null }[];
  time: string;
  onWin: () => void;
  onGameEnd: () => void;
  deactive: boolean;
}

const options: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const Sudoku: React.FC<SudokuProps> = ({ board: initialBoard, onCellChange, decreaseLive, totalLives, remainingLives, roomId, maxMembers, joinedBy, time, onWin, onGameEnd, deactive }) => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selected, setSelected] = useState<SelectedBox | undefined>();
  const [wrong, setWrong] = useState<SelectedBox | undefined>();
  const [progress, setProgress] = useState<number>(0);
  const { theme } = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (remainingLives === 0) return;
    const id = (event.target as HTMLElement).id;
    const [row, col] = id.split("-").map(Number);

    if (board.grid[row][col] === 0) {
      setSelected({ row, column: col });
    }
  };

  const getCellStyle = (row: number, col: number): string => {
    let baseStyle = "w-9 h-9 sm:h-14 sm:w-14 flex justify-center items-center text-lg m-[1px] rounded-lg shadow-sm transition-all duration-100 ";

    if (theme === 'light') {
      if (board.grid[row][col] === board.solution[row][col] && board.actual && board.actual[row][col] === 0) {
        baseStyle += "bg-emerald-100 text-emerald-700 ";
      } else if (row === wrong?.row && col === wrong.column) {
        baseStyle += "bg-rose-100 text-rose-700 ";
      } else if (selected?.row === row && selected?.column === col) {
        baseStyle += "bg-sky-200 text-sky-700 ";
      } else {
        baseStyle += "bg-zinc-100 hover:bg-gray-200 text-gray-700 ";
      }
    } else {
      if (board.grid[row][col] === board.solution[row][col] && board.actual && board.actual[row][col] === 0) {
        baseStyle += "bg-emerald-900 text-emerald-200 ";
      } else if (row === wrong?.row && col === wrong.column) {
        baseStyle += "bg-rose-900 text-rose-200 ";
      } else if (selected?.row === row && selected?.column === col) {
        baseStyle += "bg-sky-900 text-sky-200 ";
      } else {
        baseStyle += "bg-slate-900 hover:bg-gray-700 text-gray-200 ";
      }
    }

    if (board.grid[row][col] !== 0) {
      baseStyle += "font-bold cursor-not-allowed";
    } else {
      baseStyle += "cursor-pointer ";
    }

    return baseStyle;
  };

  const getGridStyle = (row: number, col: number): CSSProperties => {
    const borderColor = theme === 'light' ? '#d1d5db' : '#4b5563';
    const style: CSSProperties = {};

    if (col % 3 === 0) style.borderLeft = `2px solid ${borderColor}`;
    if (row % 3 === 0) style.borderTop = `2px solid ${borderColor}`;
    if (col === 8) style.borderRight = `2px solid ${borderColor}`;
    if (row === 8) style.borderBottom = `2px solid ${borderColor}`;

    return style;
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
      setBoard({ ...board });
      updateProgress();
      checkWin();
    } else {
      setWrong({ row: i, column: j });
      setSelected({ row: -1, column: -1 });
      decreaseLive();
    }
  };

  const handleArrowKeyPress = (event: KeyboardEvent) => {
    if (remainingLives === 0) return;
    if (!selected) return;

    let { row, column } = selected;

    const moveInDirection = (row: number, column: number, direction: string): [number, number] => {
      while (true) {
        switch (direction) {
          case 'up':
            row = Math.max(row - 1, 0);
            break;
          case 'down':
            row = Math.min(row + 1, 8);
            break;
          case 'left':
            column = Math.max(column - 1, 0);
            break;
          case 'right':
            column = Math.min(column + 1, 8);
            break;
          default:
            return [row, column];
        }

        if (board.grid[row][column] === 0) {
          return [row, column];
        }

        if (direction === 'up' && row === 0) return [row, column];
        if (direction === 'down' && row === 8) return [row, column];
        if (direction === 'left' && column === 0) return [row, column];
        if (direction === 'right' && column === 8) return [row, column];
      }
    };

    switch (event.key) {
      case 'ArrowUp':
        [row, column] = moveInDirection(row, column, 'up');
        break;
      case 'ArrowDown':
        [row, column] = moveInDirection(row, column, 'down');
        break;
      case 'ArrowLeft':
        [row, column] = moveInDirection(row, column, 'left');
        break;
      case 'ArrowRight':
        [row, column] = moveInDirection(row, column, 'right');
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (selected) {
          const value = parseInt(event.key);
          const { row: i, column: j } = selected;

          if (board.grid[i][j] === 0) {
            if (value === board.solution[i][j]) {
              board.grid[i][j] = value;
              setWrong(undefined);
              onCellChange(i, j, value);
              setBoard({ ...board });
              updateProgress();
              checkWin();
            } else {
              setWrong({ row: i, column: j });
              decreaseLive();
            }
          }
        }
        return;
      default:
        return;
    }

    if (board.grid[row][column] === 0) {
      setSelected({ row, column });
    }
  };

  const checkWin = () => {
    if (progress == 100) {
      onWin();
    }
  };

  const updateProgress = () => {
    let correctCells = 0;
    let emptyCells = 0;

    board.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === board.solution[rowIndex][colIndex]) {
          correctCells++;
        }
        if (cell === 0) {
          emptyCells++;
        }
      });
    });

    let progressPercentage = (correctCells / (81 - emptyCells)) * 100;
    setProgress(Math.round(progressPercentage));
  };

  useEffect(() => {
    const handleClickOutside: EventListener = (event: Event) => {
      const mouseEvent = event as unknown as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      if (target.id.split('-')[1] === 'optionBtn') return;
      if (target.id !== 'board') {
        setSelected({ row: -1, column: -1 });
      }
    };
    const handleArrowKeyPressWrapper: EventListener = (event: Event) => {
      const keyboardEvent = event as unknown as KeyboardEvent;
      handleArrowKeyPress(keyboardEvent);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleArrowKeyPressWrapper);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleArrowKeyPressWrapper);
    };
  }, [board, selected, theme]);

  return (
    <div className={`mx-auto flex flex-col justify-center gap-6 sm:gap-5`}>
      <div className="flex justify-center items-center">
        <RoomId 
          roomId={roomId}
          shareUrl='http://localhost:5173/play/'
        />
        <RoomDetails
          maxMembers={maxMembers}
          joinedBy={joinedBy}
          roomId={roomId}
          onGameEnd={onGameEnd}
        />
      </div>
      {deactive && (
        <div className="fixed inset-0 bg-black opacity-50 z-50" />
      )}
      <div className='block lg:hidden'>
        <BoardDetails 
          totalLives={totalLives}
          remainingLives={remainingLives}
          board={board}
          phone={true}
          progress={progress}
          setProgress={setProgress}
        />
      </div>
      <div id="board" className={`flex flex-col justify-center items-center mb-3 sm:mb-8 p-4 rounded-2xl shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        {board.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} style={getGridStyle(rowIndex, colIndex)}>
                <div
                  id={`${rowIndex}-${colIndex}`}
                  onClick={handleClick}
                  className={getCellStyle(rowIndex, colIndex)}
                >
                  {cell !== 0 ? cell : ""}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className=''>
        <div className='hidden lg:block'>
          <BoardDetails 
            totalLives={totalLives}
            remainingLives={remainingLives}
            board={board}
            phone={false}
            progress={progress}
            setProgress={setProgress}
          />
        </div>
        <OptionGrid options={options} handleOptionsClick={handleOptionsClick} />
      </div>
    </div>
  );
};

export default Sudoku;
