# Integração Redis - ENSIDE System

## Visão Geral
Este projeto implementa uma integração completa com Redis para sincronizar dados do Google Sheets com um banco de dados em cache de alta performance.

## Arquivos Criados

### 1. `.env`
Arquivo de configuração com variáveis de ambiente:
- `REDIS_URL`: URL de conexão com Redis Cloud
- `GOOGLE_SHEETS_ID`: ID da planilha Google Sheets
- `GOOGLE_API_KEY`: Chave de API do Google

### 2. `redis-sync.js`
Script de sincronização que:
- Conecta ao Redis Cloud
- Busca dados do Google Sheets via API
- Importa dados para Redis em formato de hash
- Armazena metadados de sincronização

**Uso:**
```bash
npm run sync
```

### 3. `api-redis.js`
API Express para gerenciar dados no Redis:

**Endpoints:**
- `GET /api/data` - Obter todos os registros
- `GET /api/data/:id` - Obter um registro específico
- `POST /api/data` - Criar novo registro
- `PUT /api/data/:id` - Atualizar registro
- `DELETE /api/data/:id` - Deletar registro
- `GET /api/sync-status` - Status da sincronização

**Uso:**
```bash
npm start
```

## Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente no arquivo `.env`

3. Executar sincronização inicial:
```bash
npm run sync
```

4. Iniciar API:
```bash
npm start
```

## Estrutura de Dados no Redis

### Registros de Dados
```
sheet:row:1 -> Hash com campos da planilha
sheet:row:2 -> Hash com campos da planilha
...
```

### Metadados
```
sheets:last_sync -> Timestamp da última sincronização
sheets:total_records -> Total de registros importados
```

## Fluxo de Sincronização

1. Script `redis-sync.js` é executado
2. Conecta ao Redis Cloud
3. Busca dados do Google Sheets
4. Processa headers e linhas
5. Armazena cada linha como um hash no Redis
6. Atualiza metadados de sincronização
7. Desconecta do Redis

## Integração com Vercel

A API pode ser deployada no Vercel como serverless function:

1. Adicionar variáveis de ambiente no Vercel
2. Fazer deploy: `vercel deploy`
3. API estará disponível em: `https://seu-projeto.vercel.app/api/data`

## Monitoramento

Use o Redis Insight para:
- Visualizar dados em tempo real
- Monitorar performance
- Gerenciar chaves
- Analisar uso de memória

