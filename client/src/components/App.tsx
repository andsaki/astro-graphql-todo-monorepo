import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '../lib/graphql';
import TodoList from './TodoList';
import AddTodo from './AddTodo';
import { SortOrder } from '../generated/types';

const App: React.FC = () => {
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<SortOrder>(SortOrder.Desc);

  return (
    <ApolloProvider client={client}>
      <h1>Todo App</h1>
      <AddTodo term={term} sort={sort} />
      <TodoList showSort={true} term={term} setTerm={setTerm} sort={sort} setSort={setSort} />
    </ApolloProvider>
  );
};

export default App;
