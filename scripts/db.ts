/**
 * Database utility script for Supabase PostgreSQL.
 *
 * Usage:
 *   pnpm tsx scripts/db.ts query "SELECT * FROM users LIMIT 5"
 *   pnpm tsx scripts/db.ts tables
 *   pnpm tsx scripts/db.ts describe <table_name>
 *   pnpm tsx scripts/db.ts run <sql_file>
 */

import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const DB_CONNECTION_STRING =
  "postgresql://postgres.qeufoccwtumnerzzgfvl:NYV0K9XSM27YMMhl@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

async function getClient(): Promise<Client> {
  const client = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

async function runQuery(sql: string) {
  const client = await getClient();
  try {
    const result = await client.query(sql);
    return result;
  } finally {
    await client.end();
  }
}

// --- Commands ---

async function listTables() {
  const result = await runQuery(`
    SELECT table_schema, table_name, table_type
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
  `);
  console.table(result.rows);
}

async function describeTable(tableName: string) {
  const result = await runQuery(`
    SELECT
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_name = '${tableName.replace(/'/g, "''")}'
    ORDER BY ordinal_position;
  `);
  console.log(`\nTable: ${tableName} (${result.rowCount} columns)\n`);
  console.table(result.rows);
}

async function executeQuery(sql: string) {
  const result = await runQuery(sql);
  if (result.rows && result.rows.length > 0) {
    console.table(result.rows);
  }
  console.log(`\nRows affected: ${result.rowCount}`);
}

async function runSqlFile(filePath: string) {
  const absPath = resolve(filePath);
  const sql = readFileSync(absPath, "utf-8");
  console.log(`Executing SQL from: ${absPath}\n`);
  await executeQuery(sql);
}

// --- Main ---

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "tables":
      await listTables();
      break;

    case "describe":
      if (!args[0]) {
        console.error("Usage: db.ts describe <table_name>");
        process.exit(1);
      }
      await describeTable(args[0]);
      break;

    case "query":
      if (!args[0]) {
        console.error("Usage: db.ts query <sql>");
        process.exit(1);
      }
      await executeQuery(args.join(" "));
      break;

    case "run":
      if (!args[0]) {
        console.error("Usage: db.ts run <sql_file>");
        process.exit(1);
      }
      await runSqlFile(args[0]);
      break;

    default:
      console.log(`
Database CLI Tool
=================
Commands:
  tables                  List all tables
  describe <table>        Show table columns
  query "<sql>"           Run a SQL query
  run <file.sql>          Run a SQL file
      `);
      break;
  }
}

main().catch((err) => {
  console.error("Database error:", err.message);
  process.exit(1);
});
