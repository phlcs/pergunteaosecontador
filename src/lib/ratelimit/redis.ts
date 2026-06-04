import Redis from 'ioredis'

let _redis: Redis | undefined

export function getRedis(): Redis {
  if (_redis) return _redis

  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL não está configurado')

  _redis = new Redis(url, {
    maxRetriesPerRequest: 2,
    lazyConnect: false,
  })

  _redis.on('error', (err) => {
    console.error('[Redis] connection error:', err.message)
  })

  return _redis
}
