import { VNode } from "@cycle/dom";
import { Stream, MemoryStream } from "xstream";
import xs from "xstream";
import {
  div,
  ul,
  li,
  h1,
  span,
  input,
  button,
  MainDOMSource,
} from "@cycle/dom";
import { request as graphqlRequest } from "graphql-request";
import { isDefined } from "./utils/isDefined";

import {
  TodoFragmentFragment,
  GetTodosDocument,
  UpdateTodoDocument,
  AddTodoDocument,
  GetTodosQuery,
  UpdateTodoMutation,
  AddTodoMutation,
} from "../generated/types";

// --- GraphQLと型の定義 ---
type Todo = TodoFragmentFragment;

// --- 型定義の強化 (Discriminated Union) ---
type GetTodosResponse = {
  category: "getTodos";
  __typename?: "Query";
  todos: Array<{
    __typename?: "Todo";
    id: string;
    text: string;
    completed: boolean;
  }>;
};
type UpdateTodoResponse = {
  category: "updateTodo";
  __typename?: "Mutation";
  updateTodo?: {
    __typename?: "Todo";
    id: string;
    text: string;
    completed: boolean;
  } | null;
};
type AddTodoResponse = {
  category: "addTodo";
  __typename?: "Mutation";
  addTodo?: {
    __typename?: "Todo";
    id: string;
    text: string;
    completed: boolean;
  } | null;
};

type ApiResponse = GetTodosResponse | UpdateTodoResponse | AddTodoResponse;

// Request Payload Types
interface GetTodosRequestPayload {
  query: typeof GetTodosDocument;
  variables: {};
  category: "getTodos";
}

interface UpdateTodoRequestPayload {
  query: typeof UpdateTodoDocument;
  variables: { id: string; completed: boolean };
  category: "updateTodo";
}

interface AddTodoRequestPayload {
  query: typeof AddTodoDocument;
  variables: { text: string };
  category: "addTodo";
}

type RequestPayload =
  | GetTodosRequestPayload
  | UpdateTodoRequestPayload
  | AddTodoRequestPayload;

// Cycle.jsアプリの型定義
type AppSources = {
  DOM: MainDOMSource;
};

type AppSinks = {
  DOM: Stream<VNode>;
};

// --- App: メインのアプリケーションロジック ---
export function App(sources: AppSources): AppSinks {
  const proxyTodos$ = xs.create<Todo[]>();

  // --- INTENT (ユーザーの操作) ---
  const toggleTodoId$ = sources.DOM.select(".todo-item")
    .events("click")
    .map((ev) => {
      const target = ev.currentTarget;
      if (target instanceof HTMLElement) {
        return target.dataset.id;
      }
      return undefined;
    })
    .filter(isDefined);

  const newTodoText$: MemoryStream<string> = sources.DOM.select(
    ".new-todo-input"
  )
    .events("input")
    .map((ev) => (ev.target as HTMLInputElement).value)
    .startWith("");

  const addTodoClick$ = sources.DOM.select(".add-todo-button")
    .events("click")
    .mapTo(true);

  // --- MODEL (状態管理とロジック) ---
  const getTodosRequest$: Stream<GetTodosRequestPayload> = xs.of({
    query: GetTodosDocument,
    variables: {},
    category: "getTodos",
  });

  const updateTodoRequest$: Stream<UpdateTodoRequestPayload> = toggleTodoId$
    .map((id) =>
      proxyTodos$.take(1).map((todos): UpdateTodoRequestPayload => {
        const todo = todos.find((t) => t.id === id);
        return {
          query: UpdateTodoDocument,
          variables: { id, completed: !todo?.completed },
          category: "updateTodo",
        };
      })
    )
    .flatten();

  const addTodoRequest$: Stream<AddTodoRequestPayload> = xs
    .combine(newTodoText$, addTodoClick$)
    .filter(([text, clicked]) => clicked && text.trim().length > 0)
    .map(
      ([text]): AddTodoRequestPayload => ({
        query: AddTodoDocument,
        variables: { text },
        category: "addTodo",
      })
    );

  const request$: Stream<RequestPayload> = xs.merge(
    getTodosRequest$,
    updateTodoRequest$,
    addTodoRequest$
  );

  // 2. APIリクエストを送り、レスポンスのストリームを作成する
  const response$: Stream<ApiResponse> = request$
    .map((req) => {
      if (req.category === "getTodos") {
        return xs.fromPromise(
          graphqlRequest<GetTodosQuery>(
            "http://localhost:4000/graphql",
            GetTodosDocument,
            req.variables
          ).then((res): ApiResponse => ({ ...res, category: "getTodos" }))
        );
      } else if (req.category === "updateTodo") {
        return xs.fromPromise(
          graphqlRequest<UpdateTodoMutation>(
            "http://localhost:4000/graphql",
            UpdateTodoDocument,
            req.variables
          ).then((res): ApiResponse => ({ ...res, category: "updateTodo" }))
        );
      } else {
        return xs.fromPromise(
          graphqlRequest<AddTodoMutation>(
            "http://localhost:4000/graphql",
            AddTodoDocument,
            req.variables
          ).then((res): ApiResponse => ({ ...res, category: "addTodo" }))
        );
      }
    })
    .flatten();

  // 3. レスポンスを元に、Stateを更新するためのReducerストリームを作成する
  const reducer$ = response$.map((responseObject) => {
    if (responseObject.category === "getTodos") {
      return function getTodosReducer(_prev?: Todo[]): Todo[] {
        return responseObject.todos;
      };
    } else if (responseObject.category === "updateTodo") {
      return function updateTodoReducer(prev?: Todo[]): Todo[] {
        const updatedTodo = responseObject.updateTodo as TodoFragmentFragment;
        return (
          prev?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)) ?? []
        );
      };
    } else {
      return function addTodoReducer(prev?: Todo[]): Todo[] {
        const newTodo = responseObject.addTodo as TodoFragmentFragment;
        return [...(prev ?? []), newTodo];
      };
    }
  });

  // 4. Reducerを使って、アプリケーションのStateストリームを生成する
  const todos$ = reducer$.fold<Todo[] | undefined>(
    (prev, reducer) => reducer(prev),
    undefined
  );

  proxyTodos$.imitate(todos$.filter(isDefined));

  // Clear input field after adding todo
  const clearInput$ = response$
    .filter((res) => res.category === "addTodo")
    .mapTo("");

  const inputDOM$ = xs.merge(newTodoText$, clearInput$).map((text) =>
    input(".new-todo-input", {
      attrs: { type: "text", placeholder: "Add new todo", value: text },
    })
  );

  // --- VIEW (VDOMの生成) ---
  const vdom$ = xs
    .combine(todos$, inputDOM$)
    .map(([todos, inputVNode]) =>
      todos
        ? div([
            h1("Todo List"),
            div(".add-todo-form", [
              inputVNode,
              button(".add-todo-button", "Add Todo"),
            ]),
            ul(
              todos.map((todo) =>
                li(
                  `.todo-item ${todo.completed ? ".completed" : ""}`,
                  { dataset: { id: todo.id } },
                  [span(todo.text), span(todo.completed ? "✓" : "✗")]
                )
              )
            ),
          ])
        : div("Loading...")
    );

  return {
    DOM: vdom$,
  };
}
