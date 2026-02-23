// API Configuration
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Constants
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timecardBody = document.getElementById('timecard-body');
const employeeInput = document.getElementById('employee-name');
const employeeDropdown = document.getElementById('employee-dropdown-menu');

// =====================
// EMPLOYEE MANAGEMENT
// =====================

class EmployeeManager {
    constructor() {
        this.employees = [];
        this.initDefaultEmployee();
    }

    async initDefaultEmployee() {
        try {
            const employees = await this.loadEmployees();
            if (employees.length === 0) {
                // Add default employee if none exist
                await this.addEmployee('JILL');
            }
        } catch (error) {
            console.error('Error initializing employees:', error);
        }
    }

    async loadEmployees() {
        try {
            const response = await fetch(`${API_BASE}/employees`);
            if (!response.ok) throw new Error('Failed to fetch employees');
            this.employees = await response.json();
            return this.employees;
        } catch (error) {
            console.error('Error loading employees:', error);
            return [];
        }
    }

    async addEmployee(name) {
        const trimmedName = name.trim().toUpperCase();
        if (!trimmedName) return false;

        try {
            const response = await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName })
            });

            if (response.ok) {
                await this.loadEmployees();
                return true;
            } else if (response.status === 409) {
                // Employee already exists
                await this.loadEmployees();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding employee:', error);
            return false;
        }
    }

    getEmployees() {
        return [...this.employees];
    }

    filterEmployees(query) {
        if (!query) return this.employees;
        const lowerQuery = query.toLowerCase();
        return this.employees.filter(emp => 
            emp.toLowerCase().includes(lowerQuery)
        );
    }
}

// Initialize Employee Manager
const employeeManager = new EmployeeManager();

// =====================
// TIMESHEET MANAGEMENT
// =====================

class TimesheetManager {
    async saveTimesheet(employeeName, weekPeriod, totalMinutes) {
        try {
            const response = await fetch(`${API_BASE}/timesheets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeName: employeeName.trim().toUpperCase(),
                    weekPeriod: weekPeriod,
                    totalMinutes: totalMinutes
                })
            });

            if (!response.ok) throw new Error('Failed to save timesheet');
            return await response.json();
        } catch (error) {
            console.error('Error saving timesheet:', error);
            throw error;
        }
    }

    async getTimesheetsByWeekPeriod(weekPeriod) {
        try {
            const response = await fetch(`${API_BASE}/timesheets/${encodeURIComponent(weekPeriod)}`);
            if (!response.ok) throw new Error('Failed to fetch timesheets');
            return await response.json();
        } catch (error) {
            console.error('Error fetching timesheets:', error);
            return [];
        }
    }

    async getAllWeekPeriods() {
        try {
            const response = await fetch(`${API_BASE}/week-periods`);
            if (!response.ok) throw new Error('Failed to fetch week periods');
            const periods = await response.json();
            return periods.sort().reverse(); // Most recent first
        } catch (error) {
            console.error('Error fetching week periods:', error);
            return [];
        }
    }
}

// Initialize Timesheet Manager
const timesheetManager = new TimesheetManager();

// =====================
// UI FUNCTIONS
// =====================

// Initialize the table rows
function initializeTable() {
    days.forEach((day, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="day-label">${day}</td>
            <td>
                <div class="time-input-group">
                    <input type="number" class="time-input start-hour" min="1" max="12" placeholder="00" data-day="${index}">
                    <span class="time-separator">:</span>
                    <input type="number" class="time-input start-minute" min="0" max="59" placeholder="00" data-day="${index}">
                    <select class="ampm-select start-ampm" data-day="${index}">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
            </td>
            <td>
                <div class="time-input-group">
                    <input type="number" class="time-input end-hour" min="1" max="12" placeholder="00" data-day="${index}">
                    <span class="time-separator">:</span>
                    <input type="number" class="time-input end-minute" min="0" max="59" placeholder="00" data-day="${index}">
                    <select class="ampm-select end-ampm" data-day="${index}">
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
            </td>
            <td>
                <input type="number" class="break-input break-deduction" step="0.01" min="0" placeholder="0" data-day="${index}">
            </td>
            <td>
                <span class="total-display day-total" data-day="${index}">0 hrs 0 minutes</span>
            </td>
        `;
        timecardBody.appendChild(row);
    });
}

// Employee Dropdown Functions
let dropdownClickInProgress = false;

async function showEmployeeDropdown() {
    const dropdown = document.getElementById('employee-dropdown-menu');
    const query = employeeInput.value.trim();
    const filtered = employeeManager.filterEmployees(query);
    
    dropdown.innerHTML = '';
    
    if (filtered.length === 0 && query) {
        const newItem = document.createElement('div');
        newItem.className = 'dropdown-item new-employee';
        newItem.innerHTML = `<span>+</span> Add "${query}"`;
        newItem.onmousedown = (e) => {
            e.preventDefault();
            dropdownClickInProgress = true;
            addNewEmployee(query);
        };
        dropdown.appendChild(newItem);
    } else {
        const employeesToShow = query ? filtered : employeeManager.getEmployees();
        
        employeesToShow.forEach(emp => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = emp;
            item.onmousedown = (e) => {
                e.preventDefault();
                dropdownClickInProgress = true;
                selectEmployee(emp);
            };
            dropdown.appendChild(item);
        });
        
        if (query && !employeesToShow.includes(query)) {
            const newItem = document.createElement('div');
            newItem.className = 'dropdown-item new-employee';
            newItem.innerHTML = `<span>+</span> Add "${query}"`;
            newItem.onmousedown = (e) => {
                e.preventDefault();
                dropdownClickInProgress = true;
                addNewEmployee(query);
            };
            dropdown.appendChild(newItem);
        }
        
        if (!query) {
            const newItem = document.createElement('div');
            newItem.className = 'dropdown-item new-employee';
            newItem.innerHTML = `<span>+</span> Add New Employee`;
            newItem.onmousedown = (e) => {
                e.preventDefault();
                dropdownClickInProgress = true;
                employeeInput.focus();
                employeeInput.select();
            };
            dropdown.appendChild(newItem);
        }
    }
    
    dropdown.classList.add('show');
}

function hideEmployeeDropdown() {
    if (!dropdownClickInProgress) {
        setTimeout(() => {
            const dropdown = document.getElementById('employee-dropdown-menu');
            dropdown.classList.remove('show');
        }, 150);
    }
    dropdownClickInProgress = false;
}

function selectEmployee(name) {
    employeeInput.value = name;
    setTimeout(() => {
        hideEmployeeDropdown();
    }, 100);
}

async function addNewEmployee(name) {
    const trimmedName = name.trim();
    if (!trimmedName) {
        hideEmployeeDropdown();
        return;
    }

    try {
        showLoadingSpinner(true);
        const success = await employeeManager.addEmployee(trimmedName);
        if (success) {
            employeeInput.value = trimmedName.toUpperCase();
            setTimeout(() => {
                hideEmployeeDropdown();
                showEmployeeDropdown();
            }, 100);
        }
    } catch (error) {
        alert('Error adding employee: ' + error.message);
    } finally {
        showLoadingSpinner(false);
    }
}

// =====================
// TIME CALCULATION
// =====================

function timeToMinutes(hour, minute, ampm) {
    let totalMinutes = 0;
    
    if (ampm === 'PM' && hour !== 12) {
        totalMinutes += 12 * 60;
    } else if (ampm === 'AM' && hour === 12) {
        hour = 0;
    }
    
    totalMinutes += hour * 60 + minute;
    return totalMinutes;
}

function calculateMinutes(startHour, startMinute, startAmpm, endHour, endMinute, endAmpm) {
    const startMinutes = timeToMinutes(startHour, startMinute, startAmpm);
    const endMinutes = timeToMinutes(endHour, endMinute, endAmpm);
    
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
    }
    
    return diffMinutes;
}

function formatTimeDisplay(totalMinutes) {
    if (totalMinutes <= 0) {
        return '0 hrs 0 minutes';
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    if (hours === 0) {
        return `${minutes} minutes`;
    } else if (minutes === 0) {
        return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
    } else {
        return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
}

function calculateDayTotal(dayIndex) {
    const row = timecardBody.children[dayIndex];
    const startHour = parseInt(row.querySelector('.start-hour').value) || 0;
    const startMinute = parseInt(row.querySelector('.start-minute').value) || 0;
    const startAmpm = row.querySelector('.start-ampm').value;
    const endHour = parseInt(row.querySelector('.end-hour').value) || 0;
    const endMinute = parseInt(row.querySelector('.end-minute').value) || 0;
    const endAmpm = row.querySelector('.end-ampm').value;
    const breakDeductionHours = parseFloat(row.querySelector('.break-deduction').value) || 0;
    
    if (startHour && endHour) {
        const totalMinutes = calculateMinutes(startHour, startMinute, startAmpm, endHour, endMinute, endAmpm);
        const breakDeductionMinutes = breakDeductionHours * 60;
        const finalMinutes = Math.max(0, totalMinutes - breakDeductionMinutes);
        row.querySelector('.day-total').textContent = formatTimeDisplay(finalMinutes);
        return finalMinutes;
    } else {
        row.querySelector('.day-total').textContent = '0 hrs 0 minutes';
        return 0;
    }
}

function calculateAll() {
    let weeklyTotalMinutes = 0;
    days.forEach((day, index) => {
        weeklyTotalMinutes += calculateDayTotal(index);
    });
    document.getElementById('weekly-total').textContent = formatTimeDisplay(weeklyTotalMinutes);
    return weeklyTotalMinutes;
}

// =====================
// WEEK PERIOD DISPLAY
// =====================

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateWeekPeriodDisplay() {
    const startDate = document.getElementById('week-start-date').value;
    const endDate = document.getElementById('week-end-date').value;
    
    if (startDate && endDate) {
        const formattedStart = formatDate(startDate);
        const formattedEnd = formatDate(endDate);
        document.getElementById('week-period-display').textContent = `${formattedStart} - ${formattedEnd}`;
    } else {
        document.getElementById('week-period-display').textContent = '{startdate-enddate}';
    }
}

// =====================
// MAIN FUNCTIONS
// =====================

function clearAll() {
    document.getElementById('employee-name').value = '';
    document.getElementById('week-start-date').value = '';
    document.getElementById('week-end-date').value = '';
    updateWeekPeriodDisplay();
    
    days.forEach((day, index) => {
        const row = timecardBody.children[index];
        const startHour = row.querySelector('.start-hour');
        const startMinute = row.querySelector('.start-minute');
        const endHour = row.querySelector('.end-hour');
        const endMinute = row.querySelector('.end-minute');
        
        startHour.value = '';
        startHour.placeholder = '00';
        startMinute.value = '';
        startMinute.placeholder = '00';
        row.querySelector('.start-ampm').value = 'AM';
        
        endHour.value = '';
        endHour.placeholder = '00';
        endMinute.value = '';
        endMinute.placeholder = '00';
        row.querySelector('.end-ampm').value = 'AM';
        
        row.querySelector('.break-deduction').value = '';
        row.querySelector('.day-total').textContent = '0 hrs 0 minutes';
    });
    
    document.getElementById('weekly-total').textContent = '0 hrs 0 minutes';
    hideEmployeeDropdown();
}

function printTimecard() {
    window.print();
}

async function saveTimesheet() {
    const employeeName = document.getElementById('employee-name').value.trim();
    const weekPeriod = document.getElementById('week-period-display').textContent;
    
    if (!employeeName) {
        alert('Please enter an employee name');
        return;
    }
    
    if (weekPeriod === '{startdate-enddate}') {
        alert('Please select week start and end dates');
        return;
    }
    
    const totalMinutes = calculateAll();
    
    if (totalMinutes === 0) {
        alert('Please enter time entries before saving');
        return;
    }
    
    try {
        showLoadingSpinner(true);
        await timesheetManager.saveTimesheet(employeeName, weekPeriod, totalMinutes);
        await populateWeekPeriodDropdown();
        alert('Timesheet saved successfully!');
    } catch (error) {
        alert('Error saving timesheet: ' + error.message);
    } finally {
        showLoadingSpinner(false);
    }
}

async function populateWeekPeriodDropdown() {
    const select = document.getElementById('report-week-period');
    const weekPeriods = await timesheetManager.getAllWeekPeriods();
    
    select.innerHTML = '<option value="">-- Select Week Period --</option>';
    
    weekPeriods.forEach(period => {
        const option = document.createElement('option');
        option.value = period;
        option.textContent = period;
        select.appendChild(option);
    });
}

async function generateReport() {
    const selectedWeekPeriod = document.getElementById('report-week-period').value;
    
    if (!selectedWeekPeriod) {
        alert('Please select a week period');
        return;
    }
    
    try {
        showLoadingSpinner(true);
        const timesheets = await timesheetManager.getTimesheetsByWeekPeriod(selectedWeekPeriod);
        
        if (timesheets.length === 0) {
            alert('No timesheets found for the selected week period');
            return;
        }
        
        const reportBody = document.getElementById('report-body');
        reportBody.innerHTML = '';
        
        let grandTotalMinutes = 0;
        
        timesheets.forEach(timesheet => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${timesheet.employee_name}</td>
                <td>${timesheet.week_period}</td>
                <td>${formatTimeDisplay(timesheet.total_minutes)}</td>
            `;
            reportBody.appendChild(row);
            grandTotalMinutes += timesheet.total_minutes;
        });
        
        document.getElementById('report-grand-total').innerHTML = `<strong>${formatTimeDisplay(grandTotalMinutes)}</strong>`;
        document.getElementById('report-section').style.display = 'block';
        
        document.querySelector('.report-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('Error generating report: ' + error.message);
    } finally {
        showLoadingSpinner(false);
    }
}

function printReport() {
    const printWindow = window.open('', '_blank');
    const reportSection = document.getElementById('report-section').cloneNode(true);
    const selectedWeekPeriod = document.getElementById('report-week-period').value;
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Timesheet Report - ${selectedWeekPeriod}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h2 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #667eea; color: white; }
                    tfoot { font-weight: bold; background-color: #f0f0f0; }
                    .btn { display: none; }
                </style>
            </head>
            <body>
                <h2>Timesheet Report</h2>
                <p><strong>Week Period:</strong> ${selectedWeekPeriod}</p>
                ${reportSection.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function showLoadingSpinner(show) {
    document.getElementById('loading-spinner').style.display = show ? 'flex' : 'none';
}

// =====================
// EVENT LISTENERS
// =====================

document.getElementById('employee-name').addEventListener('focus', showEmployeeDropdown);
document.getElementById('employee-name').addEventListener('blur', hideEmployeeDropdown);
document.getElementById('employee-name').addEventListener('input', showEmployeeDropdown);

document.getElementById('week-start-date').addEventListener('change', updateWeekPeriodDisplay);
document.getElementById('week-end-date').addEventListener('change', updateWeekPeriodDisplay);

document.getElementById('timecard-body').addEventListener('change', calculateAll);

// =====================
// INITIALIZATION
// =====================

document.addEventListener('DOMContentLoaded', async () => {
    initializeTable();
    await employeeManager.loadEmployees();
    await populateWeekPeriodDropdown();
});
