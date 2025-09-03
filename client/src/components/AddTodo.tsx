import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "../lib/graphql";
import type {
  AddTodoMutation,
  AddTodoMutationVariables,
} from "../generated/types";
import { GET_TODOS } from './TodoList'; // Import GET_TODOS to refetch after adding

const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

const AddTodo = () => {
  const [text, setText] = useState("");
  const [addTodo] = useMutation<AddTodoMutation, AddTodoMutationVariables>(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }], // Refetch todos after adding
  });

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
