import xs from 'xstream';
import { div, ul, li, h1 } from '@cycle/dom';
import { GraphQLClient, gql } from 'graphql-request';

// Todoの型定義
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// 1. GraphQLクライアントを作成
const client = new GraphQLClient('http://localhost:4000/graphql');

// 2. クエリを定義
const getTodosQuery = gql`
  query {
    todos {
      id
      text
      completed
    }
  }
`;

// Viewを生成するヘルパー関数
function view(todos: Todo[]) {
    return div([
        h1('Todo List'),
        ul(todos.map(todo => li(`${todo.text} ${todo.completed ? '✓' : ''}`)))
    ]);
}

export function App() {
  // 3. GraphQLリクエストのPromiseからストリームを作成
  const response$ = xs.fromPromise(client.request<{ todos: Todo[] }>(getTodosQuery));

  // 4. VDOMストリームを作成
  const vdom$ = response$
    .map(data => view(data.todos)) // 成功時のレスポンスをVDOMにマッピング
    .replaceError(() => xs.of(div(['Error loading todos']))) // エラーハンドリング
    .startWith(div(['Loading...'])); // 初期VDOM

  return {
    DOM: vdom$,
  };
}
