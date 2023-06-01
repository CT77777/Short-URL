import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// create pool connecting to DB
export const pool1 = mysql
  .createPool({
    host: process.env.RDS_MYSQL_HOST1,
    user: process.env.RDS_MYSQL_USER,
    password: process.env.RDS_MYSQL_PASSWORD,
    database: process.env.RDS_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  })
  .promise();

// store short URL and original URL to DB

// get original URL from short URL
export async function getOriginalURL1(finalKey) {
  const response = await pool1.query(
    `
        SELECT original_url FROM shorturl
        WHERE final_key = ?
    `,
    [finalKey]
  );
  const result = response[0][0];
  return result.original_url;
}
