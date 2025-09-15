import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "../lib/graphql";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { ErrorBoundary } from "react-error-boundary";
import App from "./App"; // Appコンポーネントを直接インポート
import type { SortOrder } from "../generated/types";

// 詳細なエラーメッセージを有効化
loadDevMessages();
loadErrorMessages();

// エラー時のフォールバックUI
function Fallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

// このコンポーネントが受け取るプロパティの型を定義
interface ClientRootProps {
  initialTerm: string;
  initialSort: SortOrder;
}

/**
 * ApolloProvider, ErrorBoundary, Appをまとめてレンダリングする、
 * Astroから呼び出すための唯一のラッパーコンポーネント。
 */
const ClientRoot: React.FC<ClientRootProps> = ({ initialTerm, initialSort }) => {
  return (
    <ErrorBoundary FallbackComponent={Fallback} onReset={() => {}}>
      <ApolloProvider client={client}>
        {/* childrenを渡すのではなく、Appコンポーネントを直接レンダリングする */}
        <App initialTerm={initialTerm} initialSort={initialSort} />
      </ApolloProvider>
    </ErrorBoundary>
  );
};

export default ClientRoot;
