import { Pool } from "pg";
import { DB_HOST, DB_USER, DB_DATABASE, DB_PASSWORD, DB_PORT, SSL } from "../config";

// Initialize a connection pool


const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: Number(DB_PORT || "5432"),
  ssl: SSL,
});





// Function to run a query
/**
 * 
 * @param queryText 
 * @param values 
 * @returns 
 * 
 * 
 */
export async function runQuery(queryText: string, values: any[] = []): Promise<any[] | Error> {
  

  try {
    // Use a connection from the pool to execute the query
    const res = await pool.query(queryText, values);
    if (!res.rows || res.rows.length === 0) {
      return new Error(`Query returned no results: ${queryText}`);
    }
    return res.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error(`Database query failed: ${error}`);
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
