import React, { useState } from 'react';
import { gql } from 'graphql-request';
import { client } from '../lib/graphql';
import type { AddTodoMutation, AddTodoMutationVariables } from '../generated/types';

const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

const AddTodo = ({ onAdd }: { onAdd: () => void }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await client.request<AddTodoMutation, AddTodoMutationVariables>(ADD_TODO, { text });
      setText('');
      onAdd(); // Callback to refetch the list
    } catch (error) {
      console.error('Error adding todo:', error);
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
