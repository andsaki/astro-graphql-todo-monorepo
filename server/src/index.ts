import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'node:http'
import { db } from './db' // Import the Kysely instance

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

// 2. リゾルバを定義する
const resolvers = {
  Query: {
    todos: async () => {
      return await db.selectFrom('todos').selectAll().execute();
    },
  },
  Mutation: {
    addTodo: async (_: unknown, { text }: AddTodoArgs) => {
      const result = await db.insertInto('todos').values({ text, completed: 0 }).execute();
      const newTodoId = Number(result[0].insertId); // Changed here
      const newTodo = await db.selectFrom('todos').where('id', '=', newTodoId).selectAll().executeTakeFirstOrThrow();
      return { ...newTodo, id: String(newTodo.id) };
    },
    updateTodo: async (_: unknown, { id, completed }: UpdateTodoArgs) => {
      await db.updateTable('todos').set({ completed: completed ? 1 : 0 }).where('id', '=', parseInt(id)).execute();
      const updatedTodo = await db.selectFrom('todos').where('id', '=', parseInt(id)).selectAll().executeTakeFirst();
      return updatedTodo ? { ...updatedTodo, id: String(updatedTodo.id) } : null;
    },
    deleteTodo: async (_: unknown, { id }: DeleteTodoArgs) => {
      const result = await db.deleteFrom('todos').where('id', '=', parseInt(id)).executeTakeFirst();
      return result.numDeletedRows > 0;
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