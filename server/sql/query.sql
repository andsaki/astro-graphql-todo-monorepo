-- name: CreateTodo :one
INSERT INTO todos (text, completed) VALUES (?, ?) RETURNING *;

-- name: UpdateTodo :one
UPDATE todos SET completed = ? WHERE id = ? RETURNING *;

-- name: DeleteTodo :exec
DELETE FROM todos WHERE id = ?;

-- name: ListTodos :many
SELECT * FROM todos ORDER BY id DESC;

-- name: ListTodosAsc :many
SELECT * FROM todos ORDER BY id ASC;

-- name: ListTodosByTerm :many
SELECT * FROM todos WHERE text LIKE ? ORDER BY id DESC;

-- name: ListTodosByTermAsc :many
SELECT * FROM todos WHERE text LIKE ? ORDER BY id ASC;