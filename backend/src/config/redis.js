const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));

  return redisClient;
};

const getRedis = () => {
  if (!redisClient) connectRedis();
  return redisClient;
};

module.exports = connectRedis;
module.exports.getRedis = getRedis;
