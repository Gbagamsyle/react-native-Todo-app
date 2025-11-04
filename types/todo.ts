import { Id } from "@/convex/_generated/dataModel";

export interface Todo {
  _id: Id<"todos">;
  _creationTime: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: number;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface TodoItemProps {
  todo: Todo;
  onToggle: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}