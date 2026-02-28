# Cafe 54 Timecard System

A responsive, cloud-based timecard management system for Cafe 54. Track employee hours, manage timesheets, and generate reports - accessible from any device!

## ✨ Features

- **Employee Management**: Add and manage employee names with cloud storage
- **Timesheet Tracking**: Enter work hours with AM/PM format, automatic break deduction, daily/weekly totals
- **Week-by-Week Reporting**: Generate reports for any week, view all employee hours, calculate totals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Multi-Device Access**: Access your data from any device using a single URL
- **Data Persistence**: *In-memory only* – data exists for the current session and is lost when the server restarts
- **Print Functionality**: Print individual timecards and reports

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
cd backend
npm install

# Start the server (no database required)
npm start
```

Visit: `http://localhost:5000`

### Deploy to Cloud (Free!)
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions to deploy on:
- **Render.com** (Recommended - Truly Free)
- **Railway.app** (Also Free)
- **Heroku** (Limited free tier)

## 📱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | In-memory (no persistence) |
| Hosting | Render.com / Railway.app (Free) |

## 📊 API Endpoints (memory-backed)

```
GET    /api/employees              - List all employees
POST   /api/employees              - Add new employee
POST   /api/timesheets             - Save timesheet
GET    /api/timesheets/:weekPeriod - Get week timesheets
GET    /api/week-periods           - List all weeks
GET    /api/health                 - Health check
```

## 🌐 Responsive Breakpoints

- **Mobile**: < 768px (optimized for phones)
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+ (full experience)

## 📁 Project Structure

```
TIMECARD/
├── public/
│   ├── index.html      - Main UI
│   ├── script.js       - Frontend logic & API calls
│   └── styles.css      - Responsive styling
├── backend/
│   ├── server.js       - Express server & routes
│   ├── database.js     - PostgreSQL setup
│   └── package.json    - Dependencies
├── DEPLOYMENT.md       - Deployment guide
└── README.md           - This file
```

## 💾 Data Storage
This app no longer uses a database; all information is kept in a simple in‑memory store. Data will reset when the server process restarts.

## 🔒 Notes

- **No authentication** - Add for production with sensitive data
- **Free tier limits** - Render: 750hrs/month, Railway: $5/month credit
- **Data backup** - Regular PostgreSQL backups recommended for production

## 📖 Usage

1. **Add Employee**: Click "Add New Employee" dropdown option
2. **Select Week**: Set week start/end dates
3. **Enter Hours**: Input start/end times and breaks
4. **Save**: Click "SAVE" button (data synced to cloud)
5. **Generate Report**: Select week and click "GENERATE REPORT"
6. **Multi-Device**: Use same URL on phone/tablet/desktop - all data syncs automatically

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to API | Ensure backend is running (`npm start`) |
| Database error | Check DATABASE_URL in .env file |
| CORS errors | Already configured - no action needed |
| Port in use | Change PORT in .env file |

## 📝 License

Open Source - Free to use and modify

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Role-based access (admin, manager, employee)
- [ ] Overtime calculations
- [ ] Export to CSV/Excel
- [ ] Email reports
- [ ] Mobile app (React Native)

---

**Ready to deploy?** → See [DEPLOYMENT.md](DEPLOYMENT.md)

