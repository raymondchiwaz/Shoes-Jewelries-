const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'medusa',
  password: 'postgres',
  port: 5433,
});

client.connect()
  .then(async () => {
    const res = await client.query("SELECT * FROM api_key WHERE type = 'publishable' AND revoked_at IS NULL");
    console.log('Publishable Keys:', res.rows);
    await client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    client.end();
  });
