  const path = require('path');
  const mysql = require('mysql2/promise');
  const fs = require('fs');
  require('dotenv').config({ path: path.resolve(__dirname, './secrets/mysql.env') });

  // Validate environment variables
  const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_ROOT_PASSWORD', 'MYSQL_DATABASE'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // SSL configuration (if available)
  // const sslOptions = process.env.MYSQL_SSL === 'true' ? {
  //   ssl: {
  //     rejectUnauthorized: true,
  //     ca: process.env.MYSQL_SSL_CA ? fs.readFileSync(path.resolve(__dirname, process.env.MYSQL_SSL_CA)) : undefined
  //   }
  // } : {};

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || 50,
    queueLimit: process.env.MYSQL_QUEUE_LIMIT || 100
    // ...sslOptions
  });

  // Optional: Ping database to check connection (remove in production if not needed)
  (async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection established');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
})();


  // Handle pool errors
  pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err);
    // Implement your error handling strategy here
  });

  module.exports = {
     pool,
  getConnection: () => pool.getConnection(),
  query: (sql, values) => pool.query(sql, values)  // ✅ เปลี่ยนตรงนี้
  };