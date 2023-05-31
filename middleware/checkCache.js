import { redisClient, checkRedisConnected } from "../cache/redis.js";

// check if final key exist in redis
export async function checkCache(req, res, next) {
  const finalKey = req.params.finalKey;
  if (checkRedisConnected() === false) {
    next();
    return;
  }
  const originalURL = await redisClient.get(finalKey);
  if (originalURL === null) {
    next();
    return;
  }
  console.log("Redirect to", originalURL);
  res.redirect(originalURL);
}
