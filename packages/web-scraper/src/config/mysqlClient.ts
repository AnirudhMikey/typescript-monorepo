import mysql from 'mysql2/promise';
import databaseConfig from './database';

const pool = mysql.createPool({
  ...databaseConfig,
  waitForConnections: true,
  queueLimit: 0,
});

export async function getConnection() {
  return pool.getConnection();
}

export { pool }; 