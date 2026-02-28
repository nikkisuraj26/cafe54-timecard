const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Database functionality disabled; application will run in-memory only
// const { pool, initializeDatabase, getConnectionStatus } = require('./database');
const getConnectionStatus = () => false;

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

// Get all employees (memory-only)
app.get('/api/employees', async (req, res) => {
  try {
    res.json(memoryStore.employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.json(memoryStore.employees);
  }
});

// Add new employee (memory-only)
app.post('/api/employees', async (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Employee name is required' });
  }

  const trimmedName = name.trim().toUpperCase();

  try {
    if (memoryStore.employees.includes(trimmedName)) {
      return res.status(409).json({ error: 'Employee already exists' });
    }
    memoryStore.employees.push(trimmedName);
    memoryStore.employees.sort();
    res.status(201).json({ id: Date.now(), name: trimmedName });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
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
    // Memory-only handling
    const existing = memoryStore.timesheets.find(
      t => t.employee_name === employeeName.trim().toUpperCase() && t.week_period === weekPeriod
    );
    
    if (existing) {
      existing.total_minutes = totalMinutes;
      existing.day_details = dayDetails;
      existing.date_saved = new Date().toISOString();
      res.status(200).json(existing);
    } else {
      const record = {
        id: Date.now(),
        employee_name: employeeName.trim().toUpperCase(),
        week_period: weekPeriod,
        total_minutes: totalMinutes,
        day_details: dayDetails,
        date_saved: new Date().toISOString()
      };
      memoryStore.timesheets.push(record);
      res.status(201).json(record);
    }
  } catch (error) {
    console.error('Error saving timesheet:', error);
    res.status(500).json({ error: 'Failed to save timesheet' });
  }
});

// Get all week periods (memory-only)
app.get('/api/week-periods', async (req, res) => {
  try {
    const periods = [...new Set(memoryStore.timesheets.map(t => t.week_period))];
    res.json(periods.sort().reverse());
  } catch (error) {
    console.error('Error fetching week periods:', error);
    res.status(500).json({ error: 'Failed to fetch week periods' });
  }
});

// Get timesheets by week period (memory-only)
app.get('/api/timesheets/:weekPeriod', async (req, res) => {
  const { weekPeriod } = req.params;

  try {
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

// Start server (memory-only mode)
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT} (memory-only mode)`);
  console.log(`✓ API base: http://localhost:${PORT}/api`);
  console.log('⚠️  Database functionality disabled; data will NOT persist after restart');
});
