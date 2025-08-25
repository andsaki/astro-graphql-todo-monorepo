import xs from 'xstream'; // xstream: Cycle.jsで非同期なデータフロー（ストリーム）を扱うためのライブラリ
import { div, ul, li, h1, span } from '@cycle/dom';
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
        ul(todos.map(todo =>
            // todo.completedの状態に応じて、.completedクラスを動的に追加
            li(`.todo-item ${todo.completed ? '.completed' : ''}`, [
                span(todo.text),
                span(todo.completed ? '✓' : '✗') // チェックマークもspanで囲む
            ])
        ))
    ]);
}

export function App() {
  // 3. GraphQLリクエストのPromiseからストリームを作成
  const response$ = xs.fromPromise(client.request<{ todos: Todo[] }>(getTodosQuery));

  // 4. VDOMストリームを作成
  //    xstreamのオペレータを使い、非同期処理の状態に応じて表示するVDOMを切り替える
  const vdom$ = response$
    // 【成功時】Promiseが成功裡に解決されると、レスポンスデータがここに流れてくる
    // view()ヘルパー関数を使って、TodoリストのVDOMに変換する
    .map(data => view(data.todos))
    // 【失敗時】Promiseがrejectされるなど、ストリームでエラーが発生した場合に、この処理が実行される
    // エラーをキャッチし、代わりに「エラーメッセージのVDOMを流す新しいストリーム」に差し替える
    .replaceError(() => xs.of(div(['Error loading todos'])))
    // 【初期表示】ストリームが開始すると、まず最初に同期的にこの値が流れる
    // 非同期処理（APIリクエスト）の完了を待たずに、即座に「Loading...」表示を実現する
    .startWith(div(['Loading...'])); // 初期VDOM

  return {
    DOM: vdom$,
  };
}

/*
// --- 参考：同じ機能を一般的なReact Hooksで書いた場合のコード例 ---

import React, { useState, useEffect } from 'react';
// import { GraphQLClient, gql } from 'graphql-request'; // 同ファイルでインポート済み

// React Hooksを使ったTodoリストコンポーネント
export function TodoList() {
  // 3つの状態を定義
  const [todos, setTodos] = useState<Todo[]>([]);         // データ
  const [loading, setLoading] = useState<boolean>(true);  // ローディング中か
  const [error, setError] = useState<Error | null>(null); // エラー

  // 副作用（今回はAPIリクエスト）を実行するためのHook
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // データをリセットし、ローディング開始
        setError(null);
        setLoading(true);
        
        const data = await client.request<{ todos: Todo[] }>(getTodosQuery);
        setTodos(data.todos);

      } catch (err) {
        setError(err as Error);
      } finally {
        // ローディング終了
        setLoading(false);
      }
    };

    fetchTodos();
  }, []); // 第2引数の配列が空なので、この処理はコンポーネントが最初に表示された時に1度だけ実行される

  // --- 状態に応じたUIの出し分け ---
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text} {todo.completed ? '✓' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

*/