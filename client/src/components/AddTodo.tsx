import React, { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "../lib/graphql";
import { type SortOrder } from "../generated/types";
import type {
  AddTodoMutation,
  AddTodoMutationVariables,
  GetTodosQuery,
} from "../generated/types";
import { GET_TODOS } from "../graphql/queries"; // Import GET_TODOS to update the cache
import { ADD_TODO } from "../graphql/mutations";

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
  const inputRef = useRef<HTMLInputElement>(null);
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
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
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