import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

redis.on("error", () => {
  // Redis is optional in local development; we gracefully continue without cache.
});
