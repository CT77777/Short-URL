import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = redis.createClient({
  socket: {
    host: process.env.ELASTICACHE_REDIS_HOST,
    port: process.env.ELASTICACHE_REDIS_PORT,
  },
});

let connected = false;

redisClient.on("connect", () => {
  connected = true;
  console.log("Connecting redis...");
});

redisClient.on("error", (err) => {
  connected = false;
  console.log("Connecting redis failed", err);
});

redisClient.connect();

export function checkRedisConnected() {
  return connected;
}
