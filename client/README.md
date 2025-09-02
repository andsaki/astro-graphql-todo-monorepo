# Astro + Go GraphQL Todo Monorepo

これは、モダンな Web 開発スタックで構築された、pnpm ワークスペースによるモノレポアーキテクチャを特徴とするシンプルな Todo アプリケーションです。

## 主な機能

- Todo の追加、表示、管理
- データ取得と操作のための GraphQL API
- Astro と React で構築されたフロントエンド

## 技術スタック

- **モノレポ:** [pnpm Workspaces](https://pnpm.io/workspaces)
- **バージョン管理:** [Volta](https://volta.sh/)
- **フロントエンド:**
  - [Astro](https://astro.build/)
  - [React](https://react.dev/)
  - [GraphQL Request](https://github.com/prisma-labs/graphql-request)
  - [GraphQL Code Generator](https://www.graphql-code-generator.com/)
- **バックエンド:**
  - [Go](https://go.dev/)
  - [gqlgen](https://gqlgen.com/) (GraphQL サーバーライブラリ)
  - [go-sqlite3](https://github.com/mattn/go-sqlite3) (SQLite ドライバ)

## プロジェクト構成

このプロジェクトは、2 つの主要なパッケージを持つモノレポです。

- `client/`: Astro と React で構築されたフロントエンド
- `server-go/`: Go と gqlgen で構築された GraphQL API バックエンド

## セットアップ方法

### 前提条件

- Volta (Node.js と pnpm のバージョンを自動で管理します)
- Go (v1.21 以降を推奨)

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
