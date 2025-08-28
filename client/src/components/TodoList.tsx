import { useEffect, useState, useCallback } from "react";
import { gql } from "graphql-request";
import { client } from "../lib/graphql";
import type {
  GetTodosQuery,
  UpdateTodoMutation,
  UpdateTodoMutationVariables,
  DeleteTodoMutation,
  DeleteTodoMutationVariables,
} from "../generated/types";
import AddTodo from "./AddTodo";

export const GET_TODOS = gql`
  query GetTodos {
    todos {
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

  const fetchTodos = useCallback(async () => {
    try {
      const data = await client.request<GetTodosQuery>(GET_TODOS);
      setTodos(data.todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    try {
      await client.request<UpdateTodoMutation, UpdateTodoMutationVariables>(
        UPDATE_TODO,
        { id, completed }
      );
      fetchTodos();
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
      fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div>
      <h1>Todo List</h1>
      <AddTodo onAdd={fetchTodos} />
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
