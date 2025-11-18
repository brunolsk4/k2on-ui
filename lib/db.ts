import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "MinhaSenhaSegura",
  database: process.env.DB_DATABASE || "cadastros",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  queueLimit: 0,
  namedPlaceholders: true,
});

export const db = pool;
