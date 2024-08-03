import React from 'react';
import { useTheme } from '../contexts/UserContext'; // Adjust the import path as necessary

interface OptionGridProps {
  options: number[];
  handleOptionsClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const OptionGrid: React.FC<OptionGridProps> = ({ options, handleOptionsClick }) => {
  const { theme } = useTheme(); // Assumes useTheme returns { theme: "light" | "dark" }

  return (
    <div className={`p-2 m-2 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`flex flex-wrap justify-center sm:grid gap-1 sm:gap-2 grid-cols-1 sm:grid-cols-3`}>
        {options.map((number) => (
          <div
            key={number}
            className={`flex justify-center items-center h-11 w-11 sm:h-14 sm:h-14 rounded-lg cursor-pointer transition-transform duration-200 transform hover:scale-105 active:scale-95
              ${theme === 'dark'
                ? 'bg-gray-700 text-gray-100 shadow-md hover:shadow-lg active:shadow-inner'
                : 'bg-gray-100 text-gray-900 shadow-sm hover:shadow-lg active:shadow-inner'
              }`}
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

export default OptionGrid;
