import { useState } from "react";
import type { Todo } from "../types";
import TodoItem from "./TodoItem";
import AddTodo from "./AddTodo";

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // TODO: addTodo — append a new Todo (use crypto.randomUUID() for id)
  function addTodo(todo: Omit<Todo, "id" | "completed">) {
    const newTodo = {
      id: crypto.randomUUID(),
      completed: false,
      title: todo.title,
      body: todo.body,
    };

    setTodos((todos) => [...todos, newTodo]);
  }

  // TODO: removeTodo — filter out the todo with the given id
  function removeTodo(id: string) {
    setTodos((todos) => todos.filter((todo) => todo.id !== id));
  }

  // TODO: toggleComplete — map over todos, flipping `completed` on the matching id
  function toggleComplete(id: string) {
    const todoToEditIndex = todos.findIndex((todo) => todo.id === id);
    const todoToEdit = todos[todoToEditIndex];

    setTodos((todos) =>
      todos.map((todo) => {
        if (todo.id === todoToEdit.id) {
          return {
            ...todo,
            completed: !todo.completed,
          };
        }
        return todo;
      }),
    );
  }

  // TODO: editTodo — map over todos, merging updates into the matching todo
  function editTodo(id: string, updates: Partial<Omit<Todo, "id">>) {
    const todoToEditIndex = todos.findIndex((todo) => todo.id === id);
    const todoToEdit = todos[todoToEditIndex];

    setTodos((todos) =>
      todos.map((todo) => {
        if (todo.id === todoToEdit.id) {
          return {
            ...todo,
            ...updates,
          };
        }
        return todo;
      }),
    );
  }

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
  );
}

export default TodoList;
