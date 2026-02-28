# Cafe 54 Timecard System - Deployment Guide

## Overview
This is a complete, responsive, cloud-based timecard management system using:
- **Frontend**: HTML, CSS, JavaScript (responsive for all devices)
- **Backend**: Node.js + Express
- **Database**: None (in-memory only)
- **Hosting**: Free tier services

## Project Structure
```
TIMECARD/
├── public/
│   ├── index.html       (Frontend UI)
│   ├── script.js        (Frontend API calls)
│   └── styles.css       (Responsive styling)
├── backend/
│   ├── server.js        (Express server)
│   ├── database.js      (PostgreSQL connection)
│   ├── package.json     (Dependencies)
│   └── .env.example     (Environment template)
└── README.md
```

## Quick Start - Local Development

### Prerequisites
- Node.js (v14 or higher)

*(No database installation required; the app runs purely in memory.)*

### Step 1: Setup Backend
```bash
cd backend
npm install

# Start the server (no database connection needed)
npm start
```

The server will run on `http://localhost:5000` and store data in memory until restarted.

Server runs at: `http://localhost:5000`

### Step 5: Access Frontend
Open browser: `http://localhost:5000`

---

## Deployment to Production (Free Options)

### Option 1: Render.com (Recommended - Truly Free)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account

#### Step 2: Deploy Backend on Render (memory-only)
1. Push your code to GitHub (if not already)
   ```bash
   git remote add origin https://github.com/nikkisuraj26/cafe54-timecard.git
   git branch -M main
   git push -u origin main
   ```
2. Dashboard → New → Web Service
3. Connect your GitHub repository
4. Configure:
   - **Name**: `cafe54-timecard-api`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables** (Add these):
     - `PORT`: `5000`
     - `NODE_ENV`: `production`
   - **Root Directory**: (leave blank)
5. Click "Deploy" and wait for it to finish.
6. Copy your Render URL (e.g., `https://cafe54-timecard-api.onrender.com`).

*No database configuration required; data will be lost on restart.*

#### Step 4: Update Frontend for Production
1. In `public/script.js`, line 2-4:
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000/api' 
     : '/api';  // This stays the same for production
   ```
   This is already configured - no changes needed!

2. Push updated code to GitHub

3. Render will auto-redeploy

#### Step 5: Access Your App
Your app is now live at: `https://cafe54-timecard-api.onrender.com`

---

### Option 2: Railway.app (Also Free - memory only)

#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub

#### Step 2: Create New Project
1. Dashboard → New Project
2. Add services:
   - GitHub Repo (Backend)
   <!-- no database service required -->

#### Step 3: Configure Backend Service
1. Connect your GitHub repository
2. Set Environment Variables:
   - `DATABASE_URL`: [PostgreSQL connection string from Railway]
   - `PORT`: `5000`
   - `NODE_ENV`: `production`

#### Step 4: Deploy
Railway auto-deploys on GitHub push

#### Step 5: Access App
Your app URL will be shown in Railway dashboard

---

### Option 3: Heroku (Limited Free Tier - May Need Card)
Follow similar steps to Render/Railway

---

## Features

### Employee Management
✅ Add new employees
✅ Dropdown suggestions
✅ Cloud-stored employee list
✅ Access from any device

### Timesheet Tracking
✅ Enter time (AM/PM format)
✅ Automatic break deduction
✅ Daily/weekly totals
✅ Cloud-stored timesheets

### Reporting
✅ Select week period
✅ Generate reports for all employees
✅ Grand total calculations
✅ Print reports

### Responsive Design
✅ Works on desktop (1920px+)
✅ Works on tablet (768px - 1024px)
✅ Works on mobile (< 768px)
✅ All data syncs across devices

---

## Database Schema

### employees Table
```sql
id (serial primary key)
name (varchar unique)
created_at (timestamp)
```

### timesheets Table
```sql
id (serial primary key)
employee_id (foreign key)
week_period (varchar)
total_minutes (integer)
date_saved (timestamp)
unique(employee_id, week_period)
```

---

## API Endpoints

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee

### Timesheets
- `POST /api/timesheets` - Save timesheet
- `GET /api/timesheets/:weekPeriod` - Get timesheets for week
- `GET /api/week-periods` - List all week periods

### Health
- `GET /api/health` - Check API status

---

## Data Retention

✅ All data stored in PostgreSQL (persistent)
✅ No localStorage used (survives browser cache clear)
✅ Access from any device, any browser
✅ Historical data retained forever
✅ Export capability via printing

---

## Troubleshooting

### Issue: "Failed to fetch employees"
**Solution**: Check if backend is running and database is connected
```bash
cd backend
npm start
```

### Issue: Database connection error
**Solution**: Verify DATABASE_URL is correct
```
Format: postgresql://username:password@host:port/database
```

### Issue: Port already in use
**Solution**: 
```bash
# Change port in .env file
PORT=5001
```

### Issue: CORS errors
**Solution**: Already configured in `backend/server.js`

---

## Security Notes

⚠️ This app currently has NO authentication
- Anyone with the URL can access/modify data
- For production with sensitive data, add:
  1. User authentication
  2. Password protection
  3. Role-based access control

---

## Scaling

**Current limits (Free Tier)**:
- Render: 750 free hours/month
- Railway: $5 free credit/month
- Database: Suitable for 100+ employees, 1000+ records

**To upgrade**: Paid plans start ~$5-15/month per service

---

## Support

For issues:
1. Check server logs: `npm start`
2. Check browser console (F12)
3. Verify environment variables
4. Test API: `http://localhost:5000/api/health`

---

## License
Open Source - Free to use and modify

