package graph

import (
	"astro-graphql-todo/server/db"
	"astro-graphql-todo/server/graph/model"
	"strconv"
)

// mapDbTodoToModelTodo は、sqlcが生成したDBモデルをGraphQLのモデルに変換するヘルパー関数です。
func mapDbTodoToModelTodo(dbTodo db.Todo) *model.Todo {
	return &model.Todo{
		ID:        strconv.FormatInt(dbTodo.ID, 10),
		Text:      dbTodo.Text,
		Completed: dbTodo.Completed,
	}
}
