import { VNode } from '@cycle/dom';
import { Stream } from 'xstream';
import xs from 'xstream';
import { div, ul, li, h1, span, MainDOMSource } from '@cycle/dom';
import { request as graphqlRequest, gql, GraphQLClient } from 'graphql-request';

// --- GraphQLと型の定義 ---
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
const client = new GraphQLClient('http://localhost:4000/graphql');
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
// APIレスポンスの型を厳密に定義
interface GetTodosResponse {
  category: 'getTodos';
  todos: Todo[];
}
interface UpdateTodoResponse {
  category: 'updateTodo';
  updateTodo: Todo;
}
// 2つのレスポンス型の合併型
type ApiResponse = GetTodosResponse | UpdateTodoResponse;

// Stateを更新するためのReducer関数の型
type Reducer = (prevTodos?: Todo[]) => Todo[] | undefined;

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
    h1('Todo List'),
    ul(
      todos.map(todo =>
        li(
          `.todo-item ${todo.completed ? '.completed' : ''}`,
          { dataset: { id: todo.id } },
          [span(todo.text), span(todo.completed ? '✓' : '✗')]
        )
      )
    ),
  ]);
}

// --- App: メインのアプリケーションロジック ---
export function App(sources: AppSources): AppSinks {
  const proxyTodos$ = xs.create<Todo[]>();

  // --- INTENT (ユーザーの操作) ---
  const toggleTodoId$ = sources.DOM.select('.todo-item')
    .events('click')
    .map(ev => (ev.currentTarget as HTMLElement).dataset.id as string);

  // --- MODEL (状態管理とロジック) ---
  const getTodosRequest$ = xs.of({
    query: getTodosQuery,
    variables: {},
    category: 'getTodos' as const, // as constでリテラル型として推論させる
  });

  const updateTodoRequest$ = toggleTodoId$
    .map(id =>
      proxyTodos$.take(1).map(todos => {
        const todo = todos.find(t => t.id === id);
        return {
          query: updateTodoMutation,
          variables: { id, completed: !todo?.completed },
          category: 'updateTodo' as const,
        };
      })
    )
    .flatten();

  const request$ = xs.merge(getTodosRequest$, updateTodoRequest$);

  // 2. APIリクエストを送り、レスポンスのストリームを作成する
  const response$: Stream<ApiResponse> = request$
    .map(req =>
      xs
        .fromPromise(
          graphqlRequest<{ todos: Todo[] } | { updateTodo: Todo }>(
            'http://localhost:4000/graphql',
            req.query,
            req.variables
          )
        )
        .map(res => {
          // categoryの値に応じて、判別可能な合併型のオブジェクトを正しく構築する
          if (req.category === 'getTodos') {
            return { ...res, category: 'getTodos' } as GetTodosResponse;
          }
          return { ...res, category: 'updateTodo' } as UpdateTodoResponse;
        })
    )
    .flatten();

  // 3. レスポンスを元に、Stateを更新するためのReducerストリームを作成する
  const reducer$ = response$.map(responseObject => {
    // if文でチェックすると、TypeScriptがresponseObjectの型を正しく推論してくれる
    if (responseObject.category === 'getTodos') {
      return function getTodosReducer(_prev?: Todo[]): Todo[] {
        return responseObject.todos; // 安全なアクセス
      };
    }
    // このブロックでは、responseObjectはUpdateTodoResponse型だと確定している
    return function updateTodoReducer(prev?: Todo[]): Todo[] {
      const updatedTodo = responseObject.updateTodo; // 安全なアクセス
      return prev?.map(t => (t.id === updatedTodo.id ? updatedTodo : t)) ?? [];
    };
  });

  // 4. Reducerを使って、アプリケーションのStateストリームを生成する
  const todos$ = reducer$.fold<Todo[] | undefined>(
    (prev, reducer) => reducer(prev),
    undefined
  );

  proxyTodos$.imitate(todos$.filter(todos => !!todos) as Stream<Todo[]>);

  // --- VIEW (VDOMの生成) ---
  const vdom$ = todos$.map(todos =>
    todos ? view(todos) : div('Loading...')
  );

  return {
    DOM: vdom$,
  };
}