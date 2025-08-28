import { useEffect, useState, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../lib/graphql";
import type {
  GetTodosQuery,
  GetTodosQueryVariables,
  UpdateTodoMutation,
  UpdateTodoMutationVariables,
  DeleteTodoMutation,
  DeleteTodoMutationVariables,
} from "../generated/types";
import AddTodo from "./AddTodo";

export const GET_TODOS = gql`
  query GetTodos($term: String) {
    todos(term: $term) {
      id
      text
      completed
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $completed: Boolean!) {
    updateTodo(id: $id, completed: $completed) {
      id
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

const TodoList = () => {
  const [todos, setTodos] = useState<GetTodosQuery["todos"]>([]);
  const [term, setTerm] = useState("");

  const fetchTodos = useCallback(async (searchTerm: string) => {
    try {
      const data = await client.request<GetTodosQuery, GetTodosQueryVariables>(
        GET_TODOS,
        { term: searchTerm }
      );
      setTodos(data.todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTodos(term);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchTodos, term]);

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    try {
      await client.request<UpdateTodoMutation, UpdateTodoMutationVariables>(
        UPDATE_TODO,
        { id, completed }
      );
      fetchTodos(term);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await client.request<DeleteTodoMutation, DeleteTodoMutationVariables>(
        DELETE_TODO,
        { id }
      );
      fetchTodos(term);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      <AddTodo onAdd={() => fetchTodos(term)} />
      <input
        type="text"
        placeholder="Search todos"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => handleUpdateTodo(todo.id, e.target.checked)}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
