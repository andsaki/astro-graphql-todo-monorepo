# cycle-graphql-todo

これは、モダンな Web 開発スタックで構築された、pnpm ワークスペースによるモノレポアーキテクチャを特徴とするシンプルな Todo アプリケーションです。

## 主な機能

- Todo の追加、表示、管理
- データ取得と操作のための GraphQL API
- Astro と React で構築されたフロントエンド

## 技術スタック

- **モノレポ:** [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- **フロントエンド:**
  - [Astro](https://astro.build/)
  - [React](https://react.dev/)
  - [GraphQL Request](https://github.com/prisma-labs/graphql-request)
  - [GraphQL Code Generator](https://www.graphql-code-generator.com/)
- **バックエンド:**
  - [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
  - [Node.js](https://nodejs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Kysely](https://kysely.dev/) (SQL クエリビルダ)
  - [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite ドライバ)

## プロジェクト構成

このプロジェクトは、2 つの主要なパッケージを持つモノレポです。

- `client/`: Astro と React で構築されたフロントエンド
- `server/`: GraphQL API バックエンド

## セットアップ方法

### 前提条件

- [Node.js](https://nodejs.org/) (v20 以降を推奨)
- [npm](https://www.npmjs.com/)

### インストール

1.  **クライアントとサーバー両方の依存関係をインストールします:**

    ```bash
    npm install
    ```

2.  **データベースをセットアップします:**

    このコマンドは SQLite データベースを作成し、必要なマイグレーションを実行します。

    ```bash
    npm run migrate --workspace=server
    ```

### 開発サーバーの実行

このコマンドは、フロントエンドとバックエンドの開発サーバーを同時に起動します。

```bash
npm run dev
```

- フロントエンドは `http://localhost:4321` で利用可能になります。
- GraphQL API エンドポイントは `http://localhost:4000/graphql` で利用可能になります。

## 利用可能なスクリプト

### ルート

- `npm run dev`: クライアントとサーバー両方の開発サーバーを起動します。
- `npm install`: 両方のワークスペースの依存関係をインストールします。

### クライアント (`/client`)

- `npm run dev`: Astro 開発サーバーを起動します。
- `npm run build`: 本番用にクライアントアプリケーションをビルドします。
- `npm run preview`: 本番ビルドをローカルでプレビューします。
- `npm run generate`: スキーマに基づいて GraphQL の型を生成します。

### サーバー (`/server`)

- `npm run dev`: ホットリロード機能を備えた GraphQL Yoga サーバーを起動します。
- `npm run migrate`: データベースのマイグレーションを実行します。
