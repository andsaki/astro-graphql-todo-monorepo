# Astro + React + GraphQL Todo Client

## 🚀 プロジェクト構成

このクライアントプロジェクトには、以下のフォルダとファイルが含まれています。

```text
.
├── public/
├── src/
│   ├── components/
│   ├── generated/  (GraphQL Code Generatorによって自動生成)
│   ├── layouts/    (Astroのレイアウト)
│   └── pages/      (Astroのページ)
└── package.json
```

## 🧞 コマンド

すべてのコマンドは、ターミナルから**モノレポのルートディレクトリ**で実行します。

| コマンド                        | 説明                                             |
| :------------------------------ | :----------------------------------------------- |
| `pnpm install`                  | すべてのモノレポの依存関係をインストールします   |
| `pnpm dev`                      | クライアントとサーバーの開発サーバーを起動します |
| `pnpm --filter client build`    | 本番用にサイトを `./dist/` にビルドします        |
| `pnpm --filter client preview`  | ビルドをローカルでプレビューします               |
| `pnpm --filter client generate` | サーバースキーマから GraphQL の型を生成します    |

## 👀 さらに詳しく

より詳しく知りたい場合は、Astro のドキュメントを参照したり、Discord サーバーに参加してみてください。
