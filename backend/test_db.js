require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    console.log('Querying blood_samples table...');
    const result = await client.query(`
      SELECT "Disease", COUNT(*) AS count
      FROM blood_samples
      GROUP BY "Disease"
      ORDER BY count DESC
      LIMIT 5;
    `);
    
    console.log('Query result:', result.rows);
    client.release();
  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
