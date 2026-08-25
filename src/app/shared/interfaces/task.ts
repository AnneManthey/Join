export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'user-story' | 'technical-task';
  columnId: string;
  subtasksTotal: number;
  subtasksDone: number;
  assignees: string[];
}

export interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
}
