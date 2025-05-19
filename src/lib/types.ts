
export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // YYYY-MM-DD
  color?: string; // Hex color string, e.g., "#RRGGBB"
  order: number; // For ordering within a column
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  color?: string; // Hex color string
  order: number; // For ordering within a swimlane
}

export interface Swimlane {
  id: string;
  name: string;
  columnIds: string[];
  color?: string; // Hex color string
  order: number; // For ordering swimlanes on the board
}

export interface Board {
  id: string;
  name: string;
  swimlanes: Record<string, Swimlane>;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
  swimlaneOrder: string[]; // Array of swimlane IDs to maintain order
}
