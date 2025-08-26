import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { ColumnType } from 'kysely';

interface TodoTable {
  id: ColumnType<number, never, never>;
  text: string;
  completed: ColumnType<boolean, boolean, boolean>;
}

export interface DatabaseSchema {
  todos: TodoTable;
}

const dialect = new SqliteDialect({
  database: new Database('todo.db'),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
});
