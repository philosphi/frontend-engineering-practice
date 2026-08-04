import type { Todo } from '../types'

interface AddTodoProps {
  onCreateTodo: (todo: Omit<Todo, 'id' | 'completed'>) => void
}

function AddTodo({ onCreateTodo }: AddTodoProps) {
  // TODO: controlled input(s) for title/body, call onCreateTodo on submit
  return null
}

export default AddTodo
