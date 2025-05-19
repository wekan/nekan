export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // YYYY-MM-DD
  // Future additions: priority, assignee, tags, etc.
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  tasks: Record<string, Task>; // All tasks stored flat, referenced by ID in columns
}
