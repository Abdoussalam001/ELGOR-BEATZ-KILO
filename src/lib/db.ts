import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL;

let pool: mysql.Pool | null = null;

function parseConnectionString(uri: string) {
  try {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: parseInt(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    };
  } catch {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    // Ensure DATABASE_URL exists at the point of use so TypeScript can narrow the type.
    const conn = connectionString;
    if (!conn) {
      throw new Error(
        'DATABASE_URL environment variable is not set. Please check your .env.local file.'
      );
    }

    const config = parseConnectionString(conn);
    pool = mysql.createPool(config);
  }

  return pool;
}

export async function query(sql: string, params?: unknown[]) {
  const pool = getPool();
  const [results] = await pool.execute(sql, params || []);
  return results;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
