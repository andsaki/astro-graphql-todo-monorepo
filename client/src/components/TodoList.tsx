import { useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "../lib/graphql";
import { SortOrder } from "../generated/types";
import type {
  GetTodosQuery,
  GetTodosQueryVariables,
  UpdateTodoMutation,
  UpdateTodoMutationVariables,
  DeleteTodoMutation,
  DeleteTodoMutationVariables,
} from "../generated/types";

export const GET_TODOS = gql`
  query GetTodos($term: String, $sort: SortOrder) {
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
  sort: SortOrder;
  setSort: (sort: SortOrder) => void;
}

const TodoList = ({ showSort = false, term, setTerm, sort, setSort }: TodoListProps) => {
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
    const debounce = setTimeout(() => {
      refetch({ term, sort });
      const params = new URLSearchParams(window.location.search);
      if (term) {
        params.set("term", term);
      } else {
        params.delete("term");
      }
      if (sort) {
        params.set("sort", sort);
      } else {
        params.delete("sort");
      }
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params}`
      );
    }, 300);
    return () => clearTimeout(debounce);
  }, [term, sort, refetch]);

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
          onChange={(e) => setTerm(e.target.value)}
        />
        {showSort && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
          >
            <option value={SortOrder.Asc}>Asc</option>
            <option value={SortOrder.Desc}>Desc</option>
          </select>
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