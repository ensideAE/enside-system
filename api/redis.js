const redis = require('redis');

const client = redis.createClient({
  host: 'localhost',
  port: 6380
});

client.on('error', (err) => console.log('Redis Client Error', err));

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await client.connect();

    if (req.method === 'GET') {
      if (req.query.key) {
        const value = await client.get(req.query.key);
        return res.status(200).json({ key: req.query.key, value });
      } else {
        const keys = await client.keys('*');
        return res.status(200).json({ keys, total: keys.length });
      }
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;
      await client.set(key, value);
      return res.status(200).json({ success: true, key, value });
    }

    if (req.method === 'DELETE') {
      const { key } = req.body;
      await client.del(key);
      return res.status(200).json({ success: true, key });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.quit();
  }
};
