  const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
    const Redis = require('ioredis');

    const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 5,
    connectTimeout: 10000,
    });

    redis.on('connect', () => {
    console.log('✅ Redis connected');
    });

    redis.on('error', (err) => {
    console.error('❌ Redis error', err);
    });

    module.exports = redis;
