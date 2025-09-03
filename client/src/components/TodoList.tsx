import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "../lib/graphql";
import type {
  GetTodosQuery,
  GetTodosQueryVariables,
  UpdateTodoMutation,
  UpdateTodoMutationVariables,
  DeleteTodoMutation,
  DeleteTodoMutationVariables,
} from "../generated/types";

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
  const [term, setTerm] = useState("");
  const { data, loading, error, refetch } = useQuery<GetTodosQuery, GetTodosQueryVariables>(GET_TODOS, {
    variables: { term },
  });
  const [updateTodo] = useMutation<UpdateTodoMutation, UpdateTodoMutationVariables>(UPDATE_TODO);
  const [deleteTodo] = useMutation<DeleteTodoMutation, DeleteTodoMutationVariables>(DELETE_TODO);

  useEffect(() => {
    const debounce = setTimeout(() => {
      refetch({ term });
    }, 300);
    return () => clearTimeout(debounce);
  }, [term, refetch]);

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    try {
      await updateTodo({ variables: { id, completed } });
      refetch();
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo({ variables: { id } });
      refetch();
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const todos = data?.todos || [];

  return (
    <div>
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
