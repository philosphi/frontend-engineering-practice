import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onRemove: (id: string) => void
  onEdit: (id: string, updates: Partial<Omit<Todo, 'id'>>) => void
}

function TodoItem({ todo, onToggleComplete, onRemove, onEdit }: TodoItemProps) {
  // TODO: render the todo and wire up onToggleComplete / onRemove / onEdit
  return null
}

export default TodoItem
