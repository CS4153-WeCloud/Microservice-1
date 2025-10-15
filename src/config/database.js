const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_service_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool = null;

async function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      
      // Test connection
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Configuration:', {
        host: dbConfig.host,
        user: dbConfig.user,
        database: dbConfig.database
      });
      throw error;
    }
  }
  return pool;
}

async function query(sql, params) {
  const pool = await getPool();
  return pool.execute(sql, params);
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

module.exports = {
  getPool,
  query,
  closePool
};
