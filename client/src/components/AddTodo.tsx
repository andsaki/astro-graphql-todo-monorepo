import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "../lib/graphql";
import { type SortOrder } from "../generated/types";
import type {
  AddTodoMutation,
  AddTodoMutationVariables,
  GetTodosQuery,
} from "../generated/types";
import { GET_TODOS } from "./TodoList"; // Import GET_TODOS to update the cache

const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

/**
 * 新しいTODOアイテムを追加するためのコンポーネントです。
 * 入力フィールドと送信ボタンで構成されています。
 */
interface AddTodoProps {
  term: string;
  sort: SortOrder;
}

const AddTodo = ({ term, sort }: AddTodoProps) => {
  const [text, setText] = useState("");
  const [addTodo] = useMutation<AddTodoMutation, AddTodoMutationVariables>(
    ADD_TODO,
    {
      update(cache, { data }) {
        if (!data) return;
        const newTodo = data.addTodo;

        const existingTodos = cache.readQuery<GetTodosQuery>({
          query: GET_TODOS,
          variables: { term, sort },
        });

        if (existingTodos && newTodo) {
          cache.writeQuery({
            query: GET_TODOS,
            variables: { term, sort },
            data: {
              todos: [newTodo, ...existingTodos.todos],
            },
          });
        }
      },
    }
  );

  /**
   * フォームの送信を処理して、新しいTODOを追加します。
   * @param e - フォームイベント。
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await addTodo({ variables: { text } });
      setText("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo"
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default AddTodo;