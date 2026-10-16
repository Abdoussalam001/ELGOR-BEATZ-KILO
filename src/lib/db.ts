import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function parseConnectionString(uri: string): mysql.PoolOptions {
  try {
    const url = new URL(uri);
    const port = url.port ? parseInt(url.port, 10) : 3306;

    return {
      host: url.hostname,
      port,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    } as mysql.PoolOptions;
  } catch {
    throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:password@host:port/database');
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    // Read the env at call-time so builds that don't provide DATABASE_URL won't fail.
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is not set. Please configure it in your environment (locally or on Vercel).'
      );
    }

    const config = parseConnectionString(connectionString);
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
