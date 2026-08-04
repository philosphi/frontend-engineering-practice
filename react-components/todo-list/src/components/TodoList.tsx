import { useState } from 'react'
import type { Todo } from '../types'
import TodoItem from './TodoItem'
import AddTodo from './AddTodo'

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])

  // TODO: addTodo — append a new Todo (use crypto.randomUUID() for id)
  function addTodo(todo: Omit<Todo, 'id' | 'completed'>) {}

  // TODO: removeTodo — filter out the todo with the given id
  function removeTodo(id: string) {}

  // TODO: toggleComplete — map over todos, flipping `completed` on the matching id
  function toggleComplete(id: string) {}

  // TODO: editTodo — map over todos, merging updates into the matching todo
  function editTodo(id: string, updates: Partial<Omit<Todo, 'id'>>) {}

  return (
    <div>
      <AddTodo onCreateTodo={addTodo} />
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={toggleComplete}
          onRemove={removeTodo}
          onEdit={editTodo}
        />
      ))}
    </div>
  )
}

export default TodoList
