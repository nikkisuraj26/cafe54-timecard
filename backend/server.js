const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { pool, initializeDatabase, getConnectionStatus } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory data store (fallback when no database)
const memoryStore = {
  employees: ['JILL'],
  timesheets: []
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// =====================
// EMPLOYEE ENDPOINTS
// =====================

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    if (getConnectionStatus()) {
      const result = await pool.query('SELECT id, name FROM employees ORDER BY name ASC');
      res.json(result.rows.map(row => row.name));
    } else {
      // Use memory store fallback
      res.json(memoryStore.employees);
    }
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.json(memoryStore.employees);
  }
});

// Add new employee
app.post('/api/employees', async (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Employee name is required' });
  }

  const trimmedName = name.trim().toUpperCase();

  try {
    if (getConnectionStatus()) {
      const result = await pool.query(
        'INSERT INTO employees (name) VALUES ($1) RETURNING id, name',
        [trimmedName]
      );
      res.status(201).json({ id: result.rows[0].id, name: result.rows[0].name });
    } else {
      // Use memory store fallback
      if (memoryStore.employees.includes(trimmedName)) {
        return res.status(409).json({ error: 'Employee already exists' });
      }
      memoryStore.employees.push(trimmedName);
      memoryStore.employees.sort();
      res.status(201).json({ id: Date.now(), name: trimmedName });
    }
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      res.status(409).json({ error: 'Employee already exists' });
    } else {
      console.error('Error adding employee:', error);
      res.status(500).json({ error: 'Failed to add employee' });
    }
  }
});

// =====================
// TIMESHEET ENDPOINTS
// =====================

// Save timesheet
app.post('/api/timesheets', async (req, res) => {
  const { employeeName, weekPeriod, totalMinutes, dayDetails } = req.body;

  if (!employeeName || !weekPeriod || totalMinutes === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (getConnectionStatus()) {
      // Get employee ID
      const empResult = await pool.query(
        'SELECT id FROM employees WHERE name = $1',
        [employeeName.trim().toUpperCase()]
      );

      if (empResult.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const employeeId = empResult.rows[0].id;

      // Insert or update timesheet with optional day_details json
      const result = await pool.query(
        `INSERT INTO timesheets (employee_id, week_period, total_minutes, day_details, date_saved)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (employee_id, week_period) 
         DO UPDATE SET total_minutes = $3, day_details = $4, date_saved = CURRENT_TIMESTAMP
         RETURNING id, employee_id, week_period, total_minutes, day_details, date_saved`,
        [employeeId, weekPeriod, totalMinutes, dayDetails ? JSON.stringify(dayDetails) : null]
      );

      res.status(201).json(result.rows[0]);
    } else {
      // Use memory store fallback
      const existing = memoryStore.timesheets.find(
        t => t.employee_name === employeeName.trim().toUpperCase() && t.week_period === weekPeriod
      );
      
      if (existing) {
        existing.total_minutes = totalMinutes;
        existing.day_details = dayDetails;
        existing.date_saved = new Date().toISOString();
      } else {
        memoryStore.timesheets.push({
          id: Date.now(),
          employee_name: employeeName.trim().toUpperCase(),
          week_period: weekPeriod,
          total_minutes: totalMinutes,
          day_details: dayDetails,
          date_saved: new Date().toISOString()
        });
      }
      res.status(201).json({ id: Date.now(), employee_name: employeeName, week_period: weekPeriod, total_minutes: totalMinutes, day_details: dayDetails });
    }
  } catch (error) {
    console.error('Error saving timesheet:', error);
    res.status(500).json({ error: 'Failed to save timesheet' });
  }
});

// Get all week periods
app.get('/api/week-periods', async (req, res) => {
  try {
    if (getConnectionStatus()) {
      const result = await pool.query(
        `SELECT DISTINCT week_period FROM timesheets 
         ORDER BY week_period DESC`
      );
      res.json(result.rows.map(row => row.week_period));
    } else {
      // Use memory store fallback
      const periods = [...new Set(memoryStore.timesheets.map(t => t.week_period))];
      res.json(periods.sort().reverse());
    }
  } catch (error) {
    console.error('Error fetching week periods:', error);
    res.status(500).json({ error: 'Failed to fetch week periods' });
  }
});

// Get timesheets by week period
app.get('/api/timesheets/:weekPeriod', async (req, res) => {
  const { weekPeriod } = req.params;

  try {
    if (getConnectionStatus()) {
      const result = await pool.query(
        `SELECT e.name as employee_name, t.week_period, t.total_minutes, t.day_details
         FROM timesheets t
         JOIN employees e ON t.employee_id = e.id
         WHERE t.week_period = $1
         ORDER BY e.name ASC`,
        [weekPeriod]
      );
      res.json(result.rows);
    } else {
      // Use memory store fallback
      const results = memoryStore.timesheets
        .filter(t => t.week_period === weekPeriod)
        .map(t => ({
          employee_name: t.employee_name,
          week_period: t.week_period,
          total_minutes: t.total_minutes,
          day_details: t.day_details
        }))
        .sort((a, b) => a.employee_name.localeCompare(b.employee_name));
      res.json(results);
    }
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Catch-all for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
initializeDatabase().catch((error) => {
  console.warn('⚠️  Database initialization failed, running in demo mode');
}).finally(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ API base: http://localhost:${PORT}/api`);
    if (getConnectionStatus()) {
      console.log('✓ Database connected');
    } else {
      console.log('⚠️  Database NOT connected - Running in DEMO MODE');
      console.log('⚠️  Data will NOT persist after server restart');
      console.log('⚠️  To enable persistence, start PostgreSQL and restart server');
    }
  });
});
