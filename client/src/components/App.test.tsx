import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing/react";
import App from "./App";
import { SortOrder } from "../generated/types";
import { GET_TODOS } from "../graphql/queries";
import { ADD_TODO } from "../graphql/mutations";
import { GraphQLError } from "graphql";
import ClientRoot from "./ClientRoot";

// モックデータ
const mocks = {
  getTodos: {
    successAsc: {
      // ASCソート用のモック
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Asc },
      },
      result: {
        data: {
          todos: [
            {
              id: "1",
              text: "First todo",
              completed: false,
              __typename: "Todo",
            },
            {
              id: "2",
              text: "Second todo",
              completed: true,
              __typename: "Todo",
            },
            {
              id: "3",
              text: "Third todo",
              completed: false,
              __typename: "Todo",
            },
          ],
        },
      },
    },
    successDesc: {
      // DESCソート用のモック
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Desc },
      },
      result: {
        data: {
          todos: [
            {
              id: "3",
              text: "Third todo",
              completed: false,
              __typename: "Todo",
            },
            {
              id: "2",
              text: "Second todo",
              completed: true,
              __typename: "Todo",
            },
            {
              id: "1",
              text: "First todo",
              completed: false,
              __typename: "Todo",
            },
          ],
        },
      },
    },
    loading: {
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Asc },
      },
      result: {
        data: {
          todos: [],
        },
      },
      delay: 1000 * 60 * 60, // 長い遅延でローディング状態をテスト
    },
    error: {
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Asc },
      },
      error: new GraphQLError("Error fetching data"),
    },
    empty: {
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Asc },
      },
      result: {
        data: {
          todos: [],
        },
      },
    },
  },
};

describe("App", () => {
  /**
   * MockedProviderはApollo Clientが提供するテスト用のコンポーネントです。
   * これでコンポーネントをラップすることにより、実際のGraphQLサーバーへのリクエストを模倣し、
   * 代わりに`mocks`プロパティで定義された偽の（モックの）データを返します。
   * これにより、バックエンドに依存しないコンポーネントの単体テストが可能になります。
   */
  it("初期レンダリング時にタイトルが表示されること", () => {
    render(
      <MockedProvider mocks={[]}>
        <App initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );
    expect(screen.getByText("Todo App")).toBeInTheDocument();
  });

  it("データのロード中にローディング状態が表示されること", async () => {
    render(
      <MockedProvider mocks={[mocks.getTodos.loading]}>
        <App initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );
    // ローディング中は ul が半透明になるスタイルをチェック
    const list = await screen.findByRole("list");
    expect(list).toHaveStyle("opacity: 0.5");
  });

  it("Todoリストが昇順でソートされて表示されること", async () => {
    render(
      <MockedProvider mocks={[mocks.getTodos.successAsc]}>
        <App initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );

    // Todoが昇順で表示されることを確認
    const todoItems = await screen.findAllByRole("listitem");
    expect(todoItems.length).toBe(3);
    expect(todoItems[0]).toHaveTextContent("First todo");
    expect(todoItems[1]).toHaveTextContent("Second todo");
    expect(todoItems[2]).toHaveTextContent("Third todo");
  });

  it("Todoリストが降順でソートされて表示されること", async () => {
    render(
      <MockedProvider mocks={[mocks.getTodos.successDesc]}>
        <App initialTerm="" initialSort={SortOrder.Desc} />
      </MockedProvider>
    );

    // Todoが降順で表示されることを確認
    const todoItems = await screen.findAllByRole("listitem");
    expect(todoItems.length).toBe(3);
    expect(todoItems[0]).toHaveTextContent("Third todo");
    expect(todoItems[1]).toHaveTextContent("Second todo");
    expect(todoItems[2]).toHaveTextContent("First todo");
  });

  it("データが空の場合、リストが空で表示されること", async () => {
    render(
      <MockedProvider mocks={[mocks.getTodos.empty]}>
        <App initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );

    // ulタグは存在する
    const list = await screen.findByRole("list");
    expect(list).toBeInTheDocument();
    // liタグは存在しない
    expect(list.children.length).toBe(0);
  });

  it("データ取得でエラーが発生した場合、エラーメッセージが表示されること", async () => {
    render(
      <MockedProvider mocks={[mocks.getTodos.error]}>
        <App initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );

    // "Error: Error fetching data"が表示されるのを待つ
    expect(await screen.findByText(/Error: /)).toBeInTheDocument();
  });

  it("ClientRootがエラーなく正常にAppコンポーネントを表示すること", () => {
    render(<ClientRoot initialTerm="" initialSort={SortOrder.Asc} />);
    // Appコンポーネントの中身である「Todo App」というテキストが表示されることを確認
    expect(screen.getByText("Todo App")).toBeInTheDocument();
    // フォールバックUIが表示されていないことを確認
    expect(screen.queryByText("Something went wrong:")).not.toBeInTheDocument();
  });

  it("新しいTodoを入力して追加ボタンを押すと、リストにTodoが追加されること", async () => {
    const newTodoText = "新しいTodoタスク";

    // 1. 初期表示時はTodoが空であるというモック
    const getTodosMockEmpty = {
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Asc },
      },
      result: {
        data: {
          todos: [],
        },
      },
    };

    // 2. addTodoミューテーションが呼ばれた際のモック
    const addTodoMutationMock = {
      request: {
        query: ADD_TODO,
        variables: { text: newTodoText },
        operationName: "AddTodo",
      },
      result: {
        data: {
          addTodo: {
            id: "3",
            text: newTodoText,
            completed: false,
            __typename: "Todo",
          },
        },
      },
    };

    // 3. addTodoミューテーション成功後、GET_TODOSが再度呼ばれた際のモック
    const getTodosMockAfterAdd = {
      request: {
        query: GET_TODOS,
        variables: { term: "", sort: SortOrder.Asc },
      },
      result: {
        data: {
          todos: [
            {
              id: "3",
              text: newTodoText,
              completed: false,
              __typename: "Todo",
            },
          ],
        },
      },
    };

    // モックの順序が重要
    const mocks = [
      getTodosMockEmpty,
      addTodoMutationMock,
      getTodosMockAfterAdd,
    ];

    render(
      <MockedProvider mocks={mocks}>
        <ClientRoot initialTerm="" initialSort={SortOrder.Asc} />
      </MockedProvider>
    );

    // 初期状態ではリストが空であることを確認
    await waitFor(() => {
      expect(screen.queryByRole("listitem")).toBeNull();
    });

    // フォームの入力と送信
    const input = screen.getByPlaceholderText("Add a new todo");
    const addButton = screen.getByRole("button", { name: "Add" });

    fireEvent.change(input, { target: { value: newTodoText } });
    fireEvent.click(addButton);

    // 新しいTodoがリストに表示されるのを待つ
    await waitFor(
      () => {
        expect(screen.getAllByText(newTodoText)).toHaveLength(1);
      },
      { timeout: 5000 } // 例: タイムアウトを5秒に設定
    );
  });
});
