# Todo List

## Problem Statement

Build a todo list: add a todo, remove a todo, toggle a todo's
completed state, and edit a todo's title/body — all while keeping
state management, immutability, and component composition correct.

## Concepts Exercised

- Single source of truth: the todo array lives in one component
  (`TodoList`), passed down as props
- Immutable updates: `filter` for remove, `map` for edit/toggle,
  spread for add — never mutate in place, since React's bailout
  check is reference equality, not deep comparison
- Component composition: `TodoItem` and `AddTodo` receive data and
  callbacks as props, with no local copy of the todo array
- Controlled inputs (`AddTodo`)

## Data Shape

```ts
interface Todo {
  id: string
  title: string
  body: string
  completed: boolean
}
```

## Structure

```
src/
  App.tsx              — mounts TodoList
  types.ts              — Todo interface
  components/
    TodoList.tsx        — owns state, defines addTodo/removeTodo/toggleComplete/editTodo
    TodoItem.tsx        — receives one todo + callbacks as props
    AddTodo.tsx         — controlled input(s), calls onCreateTodo on submit
```

`TodoList`, `TodoItem`, and `AddTodo` are scaffolded with prop types
and `TODO` markers — the state management and rendering logic is
the exercise.

## Running

```bash
npm install
npm run dev
```

`npm run build` runs `tsc -b` first, so it won't pass until the
`TODO`s are implemented — that's expected on a fresh scaffold.

## Approach

_TBD — fill in after implementing._

## Lessons Learned

_TBD — fill in after implementing._
