# Astro GraphQL Todo Monorepo

これは、モダンな Web 開発スタックで構築された、pnpm ワークスペースによるモノレポアーキテクチャを特徴とするシンプルな Todo アプリケーションです。

## 主な機能

- Todo の追加、表示、管理
- Todo の検索とソート (昇順/降順)
- データ取得と操作のための GraphQL API
- Astro と React で構築されたフロントエンド

## 技術スタック

- **モノレポ:** [pnpm Workspaces](https://pnpm.io/workspaces)
- **バージョン管理:** [Volta](https://volta.sh/) (Node.js と pnpm のバージョンを自動で管理します)
- **フロントエンド:**
  - [Astro](https://astro.build/)
  - [React](https://react.dev/)
  - [GraphQL Request](https://github.com/prisma-labs/graphql-request)
  - [GraphQL Code Generator](https://www.graphql-code-generator.com/)
  - [@apollo/client](https://www.apollographql.com/docs/react/) (GraphQL クライアント)
- **バックエンド:**
  - [Go](https://go.dev/) (v1.23.0 以降を推奨)
  - [gqlgen](https://gqlgen.com/) (GraphQL サーバーライブラリ)
  - [sqlc](https://sqlc.dev/) (Go 用の型安全な SQL)
  - [go-sqlite3](https://github.com/mattn/go-sqlite3) (SQLite ドライバ)

## プロジェクト構成

このプロジェクトは、2 つの主要なパッケージを持つモノレポです。

- `client/`: Astro と React で構築されたフロントエンド
- `server/`: Go と gqlgen で構築された GraphQL API バックエンド

## セットアップ方法

### 前提条件

- [Volta](https://volta.sh/) (Node.js と pnpm のバージョンを自動で管理します)
- [Go](https://go.dev/) (v1.23.0 以降を推奨)
- [sqlc](https://sqlc.dev/) (Go 用の型安全な SQL を生成するために必要です)
  - `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest` でインストールできます。

### インストール

1.  **クライアントとサーバー両方の依存関係をインストールします:**

    ```bash
    pnpm install
    ```

2.  **データベースは自動でセットアップされます:**

    開発サーバーを初めて起動すると、プロジェクトルートに `todo.db` ファイルが自動的に作成されます。

### 開発サーバーの実行

このコマンドは、フロントエンドとバックエンドの開発サーバーを同時に起動します。

```bash
pnpm run dev
```

- フロントエンドは `http://localhost:4321` で利用可能になります。
- GraphQL API エンドポイントは `http://localhost:4002/graphql` で利用可能になります。

## 利用可能なスクリプト

### ルート

- `pnpm install`: すべてのワークスペースの依存関係をインストールします。
- `pnpm run dev`: クライアントとサーバー両方の開発サーバーを起動します。
- `pnpm run db:generate`: `sqlc` を使用してデータベースクエリのGoコードを生成します。
- `pnpm run gql:generate`: `gqlgen` を使用してGraphQLのGoコードを生成します。

### クライアント (`/client`)

- `pnpm run dev`: Astro 開発サーバーを起動します。
- `pnpm run build`: 本番用にクライアントアプリケーションをビルドします。
- `pnpm run preview`: 本番ビルドをローカルでプレビューします。
- `pnpm run generate`: スキーマに基づいて GraphQL の型を生成します。
- `pnpm run test`: Vitest を使用してテストを実行します。

### サーバー (`/server`)

- `go run server.go`: Go GraphQL サーバーを起動します。(通常は `pnpm run dev` で起動されるため、直接実行する必要はありません。)
