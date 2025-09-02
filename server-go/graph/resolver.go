package graph

import "astro-graphql-todo/server-go/db"

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	Queries *db.Queries
}
