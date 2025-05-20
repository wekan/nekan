
export interface Card {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // YYYY-MM-DD
  color?: string; // Hex color string, e.g., "#RRGGBB"
  order: number; // For ordering within a list
}

export interface List {
  id: string;
  title: string;
  cardIds: string[];
  color?: string; // Hex color string
  order: number; // For ordering within a swimlane
}

export interface Swimlane {
  id: string;
  name: string;
  listIds: string[];
  color?: string; // Hex color string
  order: number; // For ordering swimlanes on the board
}

export interface Board {
  id: string;
  name: string;
  swimlanes: Record<string, Swimlane>;
  lists: Record<string, List>;
  cards: Record<string, Card>;
  swimlaneOrder: string[]; // Array of swimlane IDs to maintain order
}
