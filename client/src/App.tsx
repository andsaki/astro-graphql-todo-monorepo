import { VNode } from "@cycle/dom";
import { Stream } from "xstream";
import xs from "xstream";
import { div, ul, li, h1, span, MainDOMSource } from "@cycle/dom";
import { request as graphqlRequest, gql } from "graphql-request";

// --- Helper Functions ---
function isDefined<T>(val: T | undefined): val is T {
  return val !== undefined;
}

// --- GraphQLと型の定義 ---
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const getTodosQuery = gql`
  query {
    todos {
      id
      text
      completed
    }
  }
`;

const updateTodoMutation = gql`
  mutation UpdateTodo($id: ID!, $completed: Boolean!) {
    updateTodo(id: $id, completed: $completed) {
      id
      text
      completed
    }
  }
`;

// --- 型定義の強化 (Discriminated Union) ---
interface GetTodosResponse {
  category: "getTodos";
  todos: Todo[];
}

interface UpdateTodoResponse {
  category: "updateTodo";
  updateTodo: Todo;
}

type ApiResponse = GetTodosResponse | UpdateTodoResponse;

// Request Payload Types
interface GetTodosRequestPayload {
  query: string;
  variables: {};
  category: "getTodos";
}

interface UpdateTodoRequestPayload {
  query: string;
  variables: { id: string; completed: boolean };
  category: "updateTodo";
}

type RequestPayload = GetTodosRequestPayload | UpdateTodoRequestPayload;

// Cycle.jsアプリの型定義
type AppSources = {
  DOM: MainDOMSource;
};

type AppSinks = {
  DOM: Stream<VNode>;
};

// --- View: Stateを元にVDOMを生成する ---
function view(todos: Todo[]): VNode {
  return div([
    h1("Todo List"),
    ul(
      todos.map((todo) =>
        li(
          `.todo-item ${todo.completed ? ".completed" : ""}`,
          { dataset: { id: todo.id } },
          [span(todo.text), span(todo.completed ? "✓" : "✗")]
        )
      )
    ),
  ]);
}

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

  // --- MODEL (状態管理とロジック) ---
  const getTodosRequest$: Stream<GetTodosRequestPayload> = xs.of({
    query: getTodosQuery,
    variables: {},
    category: "getTodos",
  });

  const updateTodoRequest$: Stream<UpdateTodoRequestPayload> = toggleTodoId$
    .map((id) =>
      proxyTodos$.take(1).map((todos): UpdateTodoRequestPayload => {
        const todo = todos.find((t) => t.id === id);
        return {
          query: updateTodoMutation,
          variables: { id, completed: !todo?.completed },
          category: "updateTodo",
        };
      })
    )
    .flatten();

  const request$: Stream<RequestPayload> = xs.merge(getTodosRequest$, updateTodoRequest$);

  // 2. APIリクエストを送り、レスポンスのストリームを作成する
  const response$: Stream<ApiResponse> = request$
    .map((req) => {
      if (req.category === "getTodos") {
        return xs.fromPromise(
          graphqlRequest<{ todos: Todo[] }>(
            "http://localhost:4000/graphql",
            req.query,
            req.variables
          ).then((res): ApiResponse => ({ ...res, category: "getTodos" }))
        );
      } else {
        return xs.fromPromise(
          graphqlRequest<{ updateTodo: Todo }>(
            "http://localhost:4000/graphql",
            req.query,
            req.variables
          ).then((res): ApiResponse => ({ ...res, category: "updateTodo" }))
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
    }
    return function updateTodoReducer(prev?: Todo[]): Todo[] {
      const updatedTodo = responseObject.updateTodo;
      return (
        prev?.map((t) => (t.id === updatedTodo.id ? updatedTodo : t)) ?? []
      );
    };
  });

  // 4. Reducerを使って、アプリケーションのStateストリームを生成する
  const todos$ = reducer$.fold<Todo[] | undefined>(
    (prev, reducer) => reducer(prev),
    undefined
  );

  proxyTodos$.imitate(todos$.filter(isDefined));

  // --- VIEW (VDOMの生成) ---
  const vdom$ = todos$.map((todos) =>
    todos ? view(todos) : div("Loading...")
  );

  return {
    DOM: vdom$,
  };
}