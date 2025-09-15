import React, { useState } from "react";
import TodoList from "./TodoList";
import AddTodo from "./AddTodo";
import { SortOrder } from "../generated/types";

export interface AppProps {
  initialTerm: string;
  initialSort: SortOrder;
}

const App: React.FC<AppProps> = ({ initialTerm, initialSort }) => {
  const [term, setTerm] = useState(initialTerm);
  const [sort, setSort] = useState<SortOrder>(initialSort);

  console.log("initialTerm", initialTerm, initialSort);

  return (
    <>
      <h1>Todo App</h1>
      <AddTodo term={term} sort={sort} />
      <TodoList
        showSort={true}
        term={term}
        setTerm={setTerm}
        sort={sort}
        setSort={setSort}
      />
    </>
  );
};

export default App;