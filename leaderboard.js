
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);

export async function upvote(postId) {
  return redis.zincrby("trending:posts", 1, postId);
}

export async function getTop(n) {
  // 1. Get post IDs and scores, highest score first
  const flat = await redis.zrevrange(
    "trending:posts",
    0,
    n - 1,
    "WITHSCORES"
  );

  // 2. Prepare rows and queue metadata requests
  const rows = [];
  const pipeline = redis.pipeline();

  for (let i = 0; i < flat.length; i += 2) {
    const id = flat[i];

    rows.push({
      id,
      score: Number(flat[i + 1]),
    });

    pipeline.hgetall(id + ":meta");
  }

  // 3. Execute all metadata requests together
  const results = await pipeline.exec();

  // 4. Combine each post's ranking and metadata
  return rows.map((row, k) => ({
    ...row,
    ...results[k][1],
  }));
}

export { redis };
