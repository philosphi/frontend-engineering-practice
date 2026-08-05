import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, updates: Partial<Omit<Todo, "id">>) => void;
}

function TodoItem({ todo, onToggleComplete, onRemove, onEdit }: TodoItemProps) {
  // TODO: render the todo and wire up onToggleComplete / onRemove / onEdit
  return (
    <div>
      <span>{todo.title}</span>
      <span>{todo.body}</span>
      <input
        checked={todo.completed}
        onClick={() => onToggleComplete(todo.id)}
      />
    </div>
  );
}

export default TodoItem;
