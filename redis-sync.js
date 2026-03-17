const redis = require('redis');
const axios = require('axios');
require('dotenv').config();

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));

const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values`;

async function importDataFromSheets() {
  try {
    console.log('Iniciando importação de dados do Google Sheets...');
    
    // Conectar ao Redis
    await client.connect();
    console.log('Conectado ao Redis com sucesso!');
    
    // Buscar dados do Google Sheets
    const response = await axios.get(`${SHEETS_API_URL}/geral?key=${process.env.GOOGLE_API_KEY}`);
    const values = response.data.values;
    
    if (!values || values.length === 0) {
      console.log('Nenhum dado encontrado no Google Sheets');
      return;
    }
    
    // Processar headers
    const headers = values[0];
    console.log(`Headers encontrados: ${headers.join(', ')}`);
    
    // Importar dados para Redis
    let importedCount = 0;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const key = `sheet:row:${i}`;
      const data = {};
      
      headers.forEach((header, index) => {
        data[header] = row[index] || '';
      });
      
      await client.hSet(key, data);
      importedCount++;
    }
    
    console.log(`✓ ${importedCount} registros importados com sucesso!`);
    
    // Armazenar metadados
    await client.set('sheets:last_sync', new Date().toISOString());
    await client.set('sheets:total_records', importedCount.toString());
    
    console.log('Sincronização concluída!');
    
  } catch (error) {
    console.error('Erro durante importação:', error.message);
  } finally {
    await client.quit();
  }
}

// Executar importação
importDataFromSheets();
