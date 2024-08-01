class SudokuGridGenerator {
  private grid: number[][];
  private solution: number[][];

  constructor() {
    this.grid = this.initializeEmptyGrid();
    this.solution = this.initializeEmptyGrid();
  }

  public static main(): void {
    const generator = new SudokuGridGenerator();
    const grid = generator.generateGrid();
    console.log("Generated Grid:");
    generator.printGrid(grid);
    console.log("Solution:");
    generator.printGrid(generator.solution);
  }

  private initializeEmptyGrid(): number[][] {
    return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
  }

  public generateGrid(): number[][] {
    this.fillFirstRow();
    this.fillGridRecursively(1, 0, this.solution);
    this.shuffleRows();
    this.shuffleColumns();
    this.removeNumbers();
    return this.grid;
  }

  private fillFirstRow(): void {
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
    shuffle(numbers);
    this.solution[0] = numbers;
  }

  private fillGridRecursively(row: number, col: number, grid: number[][]): boolean {
    if (row === 9) return true;
    if (col === 9) return this.fillGridRecursively(row + 1, 0, grid);
    if (grid[row][col] !== 0) return this.fillGridRecursively(row, col + 1, grid);

    for (let num = 1; num <= 9; num++) {
      if (this.isValidNumber(row, col, num, grid)) {
        grid[row][col] = num;
        if (this.fillGridRecursively(row, col + 1, grid)) return true;
        grid[row][col] = 0;
      }
    }

    return false;
  }

  private isValidNumber(row: number, col: number, num: number, grid: number[][]): boolean {
    return (
      !grid[row].includes(num) &&
      !this.getColumn(col, grid).includes(num) &&
      !this.getBox(row, col, grid).includes(num)
    );
  }

  private getColumn(col: number, grid: number[][]): number[] {
    return grid.map((row) => row[col]);
  }

  private getBox(row: number, col: number, grid: number[][]): number[] {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    return grid
      .slice(boxRow, boxRow + 3)
      .map((r) => r.slice(boxCol, boxCol + 3))
      .flat();
  }

  private shuffleRows(): void {
    for (let i = 0; i < 9; i += 3) {
      const rows = this.solution.slice(i, i + 3);
      for (let j = 0; j < 3; j++) {
        shuffle(rows[j]);
      }
      this.solution.splice(i, 3, ...rows);
    }
  }
  
  private shuffleColumns(): void {
    for (let i = 0; i < 9; i += 3) {
      const columns = this.getColumns(i, i + 3);
      for (let j = 0; j < 3; j++) {
        shuffle(columns[j]);
      }
      this.setColumn(i, columns);
    }
  }

  private getColumns(start: number, end: number): number[][] {
    return this.solution.map((row) => row.slice(start, end));
  }

  private setColumn(index: number, columns: number[][]): void {
    for (let i = 0; i < 9; i++) {
      this.solution[i].splice(index, 3, ...columns[i]);
    }
  }

  private removeNumbers(): void {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.grid[i][j] = this.solution[i][j];
        if (Math.random() < 0.7) {
          this.grid[i][j] = 0;
        }
      }
    }
  }

  private printGrid(grid: number[][]): void {
    for (let i = 0; i < 9; i++) {
      console.log(grid[i].join(" "));
    }
  }

  public getGrid(): number[][] {
    return this.grid;
  }

  public getSolution(): number[][] {
    return this.solution
  }

}

function shuffle(array: number[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

type gridExport = {
  grid: number[][];
  solution: number[][];
}

export function createSudokuGrid(): gridExport {
  const generator = new SudokuGridGenerator();
  generator.generateGrid();
  
  return ({
    grid: generator.getGrid(),
    solution: generator.getSolution()
  })
}