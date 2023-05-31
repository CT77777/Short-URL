import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// create pool connecting to DB
export const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  })
  .promise();

// store short URL and original URL to DB

// get original URL from short URL
export async function getOriginalURL(finalKey) {
  const response = await pool.query(
    `
        SELECT original_url FROM shorturl
        WHERE final_key = ?
    `,
    [finalKey]
  );
  const result = response[0][0];
  return result.original_url;
}
