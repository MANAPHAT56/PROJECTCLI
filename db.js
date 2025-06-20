  const path = require('path');
  const mysql = require('mysql2');
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
    queueLimit: process.env.MYSQL_QUEUE_LIMIT || 100,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 60000
    // ...sslOptions
  });

  // Optional: Ping database to check connection (remove in production if not needed)
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection established');
    connection.release();
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err);
    // Implement your error handling strategy here
  });

  module.exports = {
    pool,
    getConnection: () => {
      return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) return reject(err);
          resolve(connection);
        });
      });
    },
    query: (sql, values) => {
      return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    }
  };