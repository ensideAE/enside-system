const redis = require('redis');
const express = require('express');
const app = express();

const client = redis.createClient({
  host: 'localhost',
  port: 6380
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

app.use(express.json());
app.use(express.static('public'));

// GET all keys
app.get('/api/keys', async (req, res) => {
  try {
    const keys = await client.keys('*');
    res.json({ keys, count: keys.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET key value
app.get('/api/key/:name', async (req, res) => {
  try {
    const value = await client.get(req.params.name);
    const type = await client.type(req.params.name);
    res.json({ key: req.params.name, value, type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SET key value
app.post('/api/key', async (req, res) => {
  try {
    const { key, value } = req.body;
    await client.set(key, value);
    res.json({ success: true, key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE key
app.delete('/api/key/:name', async (req, res) => {
  try {
    await client.del(req.params.name);
    res.json({ success: true, deleted: req.params.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FLUSH all
app.post('/api/flush', async (req, res) => {
  try {
    await client.flushDb();
    res.json({ success: true, message: 'Database flushed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INFO
app.get('/api/info', async (req, res) => {
  try {
    const info = await client.info();
    res.json({ info });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Redis Manager running on http://localhost:${PORT}`);
});
