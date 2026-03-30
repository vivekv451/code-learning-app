import { Pool, PoolClient } from "pg";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL environment variable not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === "production" && {
    ssl: { rejectUnauthorized: false },
  }),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log("Query executed:", {
        text: text.substring(0, 80),
        duration: `${duration}ms`,
        rows: res.rowCount,
      });
    }
    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const closePool = async () => {
  await pool.end();
  console.log("Database pool closed");
};

export default pool;