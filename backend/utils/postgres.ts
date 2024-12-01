import { Pool } from "pg";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_DATABASE, SSL } from "../config/index";

// Initialize a connection pool
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: parseInt(DB_PORT || "5432"),
  ssl: SSL === "true" ? true : SSL === "false" ? false : undefined,
});

// Function to run a query
export async function runQuery(queryText: string, values: any[] = []): Promise<any> {
  try {
    // Use a connection from the pool to execute the query
    const res = await pool.query(queryText, values);
    return res.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

// Clean up pool (if needed, e.g., on app shutdown)
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log("Database connection pool closed.");
  } catch (error) {
    console.error("Error closing the database connection pool:", error);
  }
}

// Function to get the current pool status (optional)
export function getPoolStatus(): string {
  return pool.totalCount > 0 ? "Pool is active" : "Pool is empty";
}
