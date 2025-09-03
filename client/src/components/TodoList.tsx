import { useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "../lib/graphql";
import {
  SortOrder,
  TodoSortField,
  type TodoSortInput,
} from "../generated/types";
import type {
  GetTodosQuery,
  GetTodosQueryVariables,
  UpdateTodoMutation,
  UpdateTodoMutationVariables,
  DeleteTodoMutation,
  DeleteTodoMutationVariables,
} from "../generated/types";

export const GET_TODOS = gql`
  query GetTodos($term: String, $sort: TodoSortInput) {
    todos(term: $term, sort: $sort) {
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

interface TodoListProps {
  showSort?: boolean;
  term: string;
  setTerm: (term: string) => void;
  sort: TodoSortInput;
  setSort: (sort: TodoSortInput) => void;
}

const TodoList = ({
  showSort = false,
  term,
  setTerm,
  sort,
  setSort,
}: TodoListProps) => {
  const { data, loading, error, refetch } = useQuery<
    GetTodosQuery,
    GetTodosQueryVariables
  >(GET_TODOS, {
    variables: { term, sort },
  });
  const [updateTodo] = useMutation<
    UpdateTodoMutation,
    UpdateTodoMutationVariables
  >(UPDATE_TODO);
  const [deleteTodo] = useMutation<
    DeleteTodoMutation,
    DeleteTodoMutationVariables
  >(DELETE_TODO);

  useEffect(() => {
    console.log("sort", sort);
    const debounce = setTimeout(() => {
      refetch({ term, sort });
    }, 300);
    return () => clearTimeout(debounce);
  }, [term, sort, refetch]);

  const updateUrl = (newTerm: string, newSort: TodoSortInput) => {
    const params = new URLSearchParams(window.location.search);
    if (newTerm) {
      params.set("term", newTerm);
    } else {
      params.delete("term");
    }
    if (newSort) {
      params.set("sortField", newSort.field);
      params.set("sortOrder", newSort.order);
    } else {
      params.delete("sortField");
      params.delete("sortOrder");
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setTerm(newTerm);
    updateUrl(newTerm, sort);
  };

  const handleSortFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = { ...sort, field: e.target.value as TodoSortField };
    setSort(newSort);
    updateUrl(term, newSort);
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = { ...sort, order: e.target.value as SortOrder };
    setSort(newSort);
    updateUrl(term, newSort);
  };

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
      <div className="controls-container">
        <input
          type="text"
          placeholder="Search todos"
          value={term}
          onChange={handleTermChange}
        />
        {showSort && (
          <>
            <select value={sort.field} onChange={handleSortFieldChange}>
              <option value={TodoSortField.Text}>Text</option>
              <option value={TodoSortField.Completed}>Completed</option>
            </select>
            <select value={sort.order} onChange={handleSortOrderChange}>
              <option value={SortOrder.Asc}>Asc</option>
              <option value={SortOrder.Desc}>Desc</option>
            </select>
          </>
        )}
      </div>
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
