# Local Development Setup

## Windows Setup

### Step 1: Install Prerequisites

#### Install Node.js
1. Go to https://nodejs.org/
2. Download LTS version (v18 or higher)
3. Run installer and follow prompts
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download installer
3. Run installer
4. Remember the password you set for `postgres` user
5. Keep default settings (Port: 5432)

### Step 2: Create Database

1. Open Command Prompt
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Create database:
   ```sql
   CREATE DATABASE cafe54_timecard;
   ```
4. Exit:
   ```sql
   \q
   ```

### Step 3: Setup Backend

1. Open Command Prompt
2. Navigate to project:
   ```bash
   cd "C:\Users\nikhi\OneDrive\Desktop\TIMECARD"
   ```
3. Go to backend folder:
   ```bash
   cd backend
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

### Step 4: Configure Environment

1. In `backend/` folder, create `.env` file:
   ```bash
   cp .env.example .env
   ```
   (Or manually create `.env` with):
   ```
   DATABASE_URL=postgresql://postgres:Nikhil@2653@localhost:5432/cafe54_timecard
   PORT=5000
   NODE_ENV=development
   ```
   Replace `your_password` with the PostgreSQL password you set

### Step 5: Start the App

1. In Command Prompt (in `backend/` folder):
   ```bash
   npm start
   ```
   
   You should see:
   ```
   ✓ Database tables initialized successfully
   ✓ Server running on port 5000
   ✓ API base: http://localhost:5000/api
   ```

2. Open browser and go to: `http://localhost:5000`

### Step 6: Test the App

1. Try adding an employee
2. Add a timesheet entry
3. Generate a report
4. If something breaks, check:
   - Command Prompt for error messages
   - Browser Console (F12 → Console tab)
   - Database connection string in `.env`

---



## Troubleshooting Local Setup

### "npm: command not found"
- Node.js not installed
- Solution: Reinstall from https://nodejs.org/

### "psql: command not found"
- PostgreSQL not in PATH
- Solution: Add PostgreSQL bin to PATH or use full path

### "Database connection failed"
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check if database exists: `psql -U postgres -c "\l"`

### "Port 5000 already in use"
- Another app using port 5000
- Solution: Change PORT in .env or stop other app

### "Cannot find module 'pg'"
- Dependencies not installed
- Solution: Run `npm install` in backend folder

---


