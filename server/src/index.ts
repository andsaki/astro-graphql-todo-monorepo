import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'node:http'

// 1. スキーマを定義する
const typeDefs = /* GraphQL */ `
  type Query {
    todos: [Todo!]!
  }
  type Mutation {
    addTodo(text: String!): Todo!
    updateTodo(id: ID!, completed: Boolean!): Todo
    deleteTodo(id: ID!): Boolean
  }
  type Todo {
    id: ID!
    text: String!
    completed: Boolean!
  }
`

// ミューテーションの引数の型を定義
interface AddTodoArgs {
  text: string;
}

interface UpdateTodoArgs {
  id: string;
  completed: boolean;
}

interface DeleteTodoArgs {
  id: string;
}

// インメモリのデータストア
let todos = [
  { id: '1', text: 'Learn GraphQL', completed: true },
  { id: '2', text: 'Build a Cycle.js app', completed: false },
]
let nextId = 3

// 2. リゾルバを定義する
const resolvers = {
  Query: {
    todos: () => todos,
  },
  Mutation: {
    addTodo: (_: unknown, { text }: AddTodoArgs) => {
      const newTodo = { id: String(nextId++), text, completed: false }
      todos.push(newTodo)
      return newTodo
    },
    updateTodo: (_: unknown, { id, completed }: UpdateTodoArgs) => {
      const todo = todos.find(t => t.id === id)
      if (todo) {
        todo.completed = completed
        return todo
      }
      return null
    },
    deleteTodo: (_: unknown, { id }: DeleteTodoArgs) => {
      const index = todos.findIndex(t => t.id === id)
      if (index > -1) {
        todos.splice(index, 1)
        return true
      }
      return false
    }
  }
}

// 3. Yogaサーバーを作成する
const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers
  })
})

// 4. HTTPサーバーを起動する
const server = createServer(yoga)
server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql')
})
