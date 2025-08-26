import { db } from './db';

async function migrate() {
  await db.schema
    .createTable('todos')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('text', 'text', (col) => col.notNull())
    .addColumn('completed', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  console.log('Migration completed');
  await db.destroy();
}

migrate();
