const { Pool } = require('pg');
require('dotenv').config();

let isConnected = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  isConnected = true;
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  isConnected = false;
  console.warn('⚠️  Database connection error:', err.message);
});

// Initialize database tables (non-blocking)
async function initializeDatabase() {
  try {
    // Test connection
    await pool.query('SELECT 1');
    
    // Create employees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create timesheets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        week_period VARCHAR(50) NOT NULL,
        total_minutes INTEGER NOT NULL,
        date_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, week_period)
      );
    `);

    isConnected = true;
    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    isConnected = false;
    console.warn('⚠️  Database initialization skipped:', error.message);
    console.warn('⚠️  Running in DEMO MODE - data will not persist after restart');
  }
}

function getConnectionStatus() {
  return isConnected;
}

module.exports = { pool, initializeDatabase, getConnectionStatus };
