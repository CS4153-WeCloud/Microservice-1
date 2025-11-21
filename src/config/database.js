const mysql = require('mysql2/promise');
const path = require('path');

// Database configuration
// Support both local development and Cloud SQL connections
let dbConfig = {
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_service_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Cloud SQL connection via Unix socket (recommended for Cloud Run)
if (process.env.INSTANCE_CONNECTION_NAME && process.env.DB_SOCKET_PATH) {
  // Use Unix socket for Cloud SQL (Cloud Run recommended)
  // Format: /cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
  dbConfig.socketPath = path.join(process.env.DB_SOCKET_PATH, process.env.INSTANCE_CONNECTION_NAME);
  console.log('🔌 Using Unix socket connection to Cloud SQL:', dbConfig.socketPath);
} else if (process.env.INSTANCE_CONNECTION_NAME && process.env.DB_HOST) {
  // Use TCP/IP connection to Cloud SQL (alternative method)
  dbConfig.host = process.env.DB_HOST;
  dbConfig.port = parseInt(process.env.DB_PORT) || 3306;
  console.log('🔌 Using TCP/IP connection to Cloud SQL');
} else {
  // Local development - use host and port
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = parseInt(process.env.DB_PORT) || 3306;
  console.log('🔌 Using local MySQL connection');
}

// SSL configuration for Cloud SQL (if certificates are provided)
if (process.env.DB_ROOT_CERT && process.env.DB_CERT && process.env.DB_KEY) {
  const fs = require('fs');
  dbConfig.ssl = {
    ca: fs.readFileSync(process.env.DB_ROOT_CERT),
    cert: fs.readFileSync(process.env.DB_CERT),
    key: fs.readFileSync(process.env.DB_KEY)
  };
  console.log('🔒 SSL/TLS certificates configured');
}

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
