const express = require('express');
const redis = require('redis');
require('dotenv').config();

const app = express();
app.use(express.json());

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

// Conectar ao Redis
client.connect().then(() => {
  console.log('Conectado ao Redis!');
}).catch(err => {
  console.error('Erro ao conectar ao Redis:', err);
});

// GET - Obter todos os dados
app.get('/api/data', async (req, res) => {
  try {
    const keys = await client.keys('sheet:row:*');
    const data = [];
    
    for (const key of keys) {
      const row = await client.hGetAll(key);
      data.push({ key, ...row });
    }
    
    res.json({
      success: true,
      total: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Obter um registro específico
app.get('/api/data/:id', async (req, res) => {
  try {
    const key = `sheet:row:${req.params.id}`;
    const data = await client.hGetAll(key);
    
    if (Object.keys(data).length === 0) {
      return res.status(404).json({ success: false, error: 'Registro não encontrado' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Criar novo registro
app.post('/api/data', async (req, res) => {
  try {
    const keys = await client.keys('sheet:row:*');
    const newId = keys.length + 1;
    const key = `sheet:row:${newId}`;
    
    await client.hSet(key, req.body);
    
    res.json({
      success: true,
      message: 'Registro criado com sucesso',
      id: newId
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - Atualizar registro
app.put('/api/data/:id', async (req, res) => {
  try {
    const key = `sheet:row:${req.params.id}`;
    await client.hSet(key, req.body);
    
    res.json({
      success: true,
      message: 'Registro atualizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - Deletar registro
app.delete('/api/data/:id', async (req, res) => {
  try {
    const key = `sheet:row:${req.params.id}`;
    await client.del(key);
    
    res.json({
      success: true,
      message: 'Registro deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Status da sincronização
app.get('/api/sync-status', async (req, res) => {
  try {
    const lastSync = await client.get('sheets:last_sync');
    const totalRecords = await client.get('sheets:total_records');
    
    res.json({
      success: true,
      lastSync: lastSync || 'Nunca sincronizado',
      totalRecords: totalRecords || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Redis rodando na porta ${PORT}`);
});
