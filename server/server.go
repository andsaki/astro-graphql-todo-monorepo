package main

import (
	"astro-graphql-todo/server/graph"
	"database/sql"
	"log"
	"net/http"
	"os"

	"astro-graphql-todo/server/db"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	_ "github.com/mattn/go-sqlite3" // Import sqlite3 driver
	"github.com/rs/cors"            // Add this line
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "4002"
const dbFile = "../todo.db" // TSサーバーと同じDBファイルを使用

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// データベースに接続
	sqlDB, err := sql.Open("sqlite3", dbFile)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer sqlDB.Close()

	// to dosテーブルが存在しない場合に作成（簡易的なマイグレーション）
	_, err = sqlDB.Exec(`CREATE TABLE IF NOT EXISTS todos (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		text TEXT NOT NULL,
		completed BOOLEAN NOT NULL CHECK (completed IN (0, 1))
	)`)
	if err != nil {
		log.Fatalf("failed to create table: %v", err)
	}

	queries := db.New(sqlDB)
	// リゾルバにデータベース接続を渡す
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{Queries: queries}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// CORSミドルウェアを追加
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4321", "http://localhost:4002"}, // Astroクライアントと自身のPlaygroundを許可
		AllowCredentials: true,
	})

	// HTTPハンドラを設定
	http.Handle("/", playground.Handler("GraphQL playground", "/graphql"))
	http.Handle("/graphql", c.Handler(srv))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}