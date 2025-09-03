import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '../lib/graphql';
import TodoList from './TodoList';
import AddTodo from './AddTodo';

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <h1>Todo App</h1>
      <AddTodo />
      <TodoList showSort={true} />
    </ApolloProvider>
  );
};

export default App;