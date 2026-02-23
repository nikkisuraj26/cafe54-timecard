// Constants
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timecardBody = document.getElementById('timecard-body');
const employeeInput = document.getElementById('employee-name');
const employeeDropdown = document.getElementById('employee-dropdown-menu');

// Employee Management
class EmployeeManager {
    constructor() {
        this.storageKey = 'cafe54_employees';
        this.employees = this.loadEmployees();
        this.initDefaultEmployees();
    }

    loadEmployees() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveEmployees() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.employees));
    }

    initDefaultEmployees() {
        if (this.employees.length === 0) {
            this.employees = ['JILL'];
            this.saveEmployees();
        }
    }

    addEmployee(name) {
        const trimmedName = name.trim();
        if (trimmedName && !this.employees.includes(trimmedName)) {
            this.employees.push(trimmedName);
            this.employees.sort();
            this.saveEmployees();
            return true;
        }
        return false;
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

// Timesheet Data Management
class TimesheetManager {
    constructor() {
        this.storageKey = 'cafe54_timesheets';
        this.timesheets = this.loadTimesheets();
    }

    loadTimesheets() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveTimesheets() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.timesheets));
    }

    saveTimesheet(employeeName, weekPeriod, totalMinutes) {
        const timesheet = {
            id: Date.now(),
            employeeName: employeeName.trim(),
            weekPeriod: weekPeriod,
            totalMinutes: totalMinutes,
            dateSaved: new Date().toISOString()
        };
        
        // Check if timesheet already exists for this employee and week period
        const existingIndex = this.timesheets.findIndex(
            t => t.employeeName === timesheet.employeeName && t.weekPeriod === timesheet.weekPeriod
        );
        
        if (existingIndex >= 0) {
            // Update existing timesheet
            this.timesheets[existingIndex] = timesheet;
        } else {
            // Add new timesheet
            this.timesheets.push(timesheet);
        }
        
        this.saveTimesheets();
        return timesheet;
    }

    getTimesheetsByWeekPeriod(weekPeriod) {
        return this.timesheets.filter(t => t.weekPeriod === weekPeriod);
    }

    getAllWeekPeriods() {
        const weekPeriods = [...new Set(this.timesheets.map(t => t.weekPeriod))];
        return weekPeriods.sort().reverse(); // Most recent first
    }
}

// Initialize Timesheet Manager
const timesheetManager = new TimesheetManager();

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

function showEmployeeDropdown() {
    const dropdown = document.getElementById('employee-dropdown-menu');
    const query = employeeInput.value.trim();
    const filtered = employeeManager.filterEmployees(query);
    
    dropdown.innerHTML = '';
    
    if (filtered.length === 0 && query) {
        // Show option to add new employee
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
        // Show all employees when no query
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
        
        // Always show "+New" option at the bottom if there's a query
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
        
        // Show "+New" option even when no query
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

function addNewEmployee(name) {
    const trimmedName = name.trim();
    if (trimmedName && employeeManager.addEmployee(trimmedName)) {
        employeeInput.value = trimmedName;
        setTimeout(() => {
            hideEmployeeDropdown();
            showEmployeeDropdown(); // Refresh dropdown
        }, 100);
    } else if (trimmedName) {
        // Employee already exists, just select it
        employeeInput.value = trimmedName;
        setTimeout(() => {
            hideEmployeeDropdown();
        }, 100);
    }
}

// Time Calculation Functions
function timeToMinutes(hour, minute, ampm) {
    let totalMinutes = 0;
    
    if (ampm === 'PM' && hour !== 12) {
        totalMinutes += 12 * 60; // Add 12 hours for PM
    } else if (ampm === 'AM' && hour === 12) {
        // 12 AM is midnight (0 hours)
        hour = 0;
    }
    
    totalMinutes += hour * 60 + minute;
    return totalMinutes;
}

function calculateMinutes(startHour, startMinute, startAmpm, endHour, endMinute, endAmpm) {
    const startMinutes = timeToMinutes(startHour, startMinute, startAmpm);
    const endMinutes = timeToMinutes(endHour, endMinute, endAmpm);
    
    // Handle case where end time is next day
    let diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add 24 hours
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
    
    // Only calculate if both start and end times are provided
    if (startHour && endHour) {
        const totalMinutes = calculateMinutes(startHour, startMinute, startAmpm, endHour, endMinute, endAmpm);
        const breakDeductionMinutes = breakDeductionHours * 60; // Convert hours to minutes
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

// Save Timesheet Function
function saveTimesheet() {
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
    
    // Calculate total minutes
    const totalMinutes = calculateAll();
    
    if (totalMinutes === 0) {
        alert('Please enter time entries before saving');
        return;
    }
    
    timesheetManager.saveTimesheet(employeeName, weekPeriod, totalMinutes);
    populateWeekPeriodDropdown();
    alert('Timesheet saved successfully!');
}

// Parse time display string to minutes
function parseTimeToMinutes(timeString) {
    if (!timeString || timeString === '0 hrs 0 minutes') return 0;
    
    const hoursMatch = timeString.match(/(\d+)\s*(?:hr|hrs)/);
    const minutesMatch = timeString.match(/(\d+)\s*(?:minute|minutes)/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours * 60 + minutes;
}

// Populate Week Period Dropdown
function populateWeekPeriodDropdown() {
    const select = document.getElementById('report-week-period');
    const weekPeriods = timesheetManager.getAllWeekPeriods();
    
    // Clear existing options except the first one
    select.innerHTML = '<option value="">-- Select Week Period --</option>';
    
    weekPeriods.forEach(period => {
        const option = document.createElement('option');
        option.value = period;
        option.textContent = period;
        select.appendChild(option);
    });
}

// Generate Report Function
function generateReport() {
    const selectedWeekPeriod = document.getElementById('report-week-period').value;
    
    if (!selectedWeekPeriod) {
        alert('Please select a week period');
        return;
    }
    
    const timesheets = timesheetManager.getTimesheetsByWeekPeriod(selectedWeekPeriod);
    
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
            <td>${timesheet.employeeName}</td>
            <td>${timesheet.weekPeriod}</td>
            <td>${formatTimeDisplay(timesheet.totalMinutes)}</td>
        `;
        reportBody.appendChild(row);
        grandTotalMinutes += timesheet.totalMinutes;
    });
    
    document.getElementById('report-grand-total').innerHTML = `<strong>${formatTimeDisplay(grandTotalMinutes)}</strong>`;
    document.getElementById('report-section').style.display = 'block';
    
    // Scroll to report
    document.querySelector('.report-container').scrollIntoView({ behavior: 'smooth' });
}

// Print Report Function
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

// Week Period Display Functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function updateWeekPeriodDisplay() {
    const startDate = document.getElementById('week-start-date').value;
    const endDate = document.getElementById('week-end-date').value;
    const display = document.getElementById('week-period-display');
    
    if (startDate && endDate) {
        const formattedStart = formatDate(startDate);
        const formattedEnd = formatDate(endDate);
        display.textContent = `{${formattedStart}-${formattedEnd}}`;
    } else if (startDate) {
        const formattedStart = formatDate(startDate);
        display.textContent = `{${formattedStart}-}`;
    } else if (endDate) {
        const formattedEnd = formatDate(endDate);
        display.textContent = `{-${formattedEnd}}`;
    } else {
        display.textContent = '{startdate-enddate}';
    }
}

// Event Listeners
function setupEventListeners() {
    // Employee input events
    employeeInput.addEventListener('focus', showEmployeeDropdown);
    employeeInput.addEventListener('input', showEmployeeDropdown);
    employeeInput.addEventListener('blur', hideEmployeeDropdown);
    
    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.employee-dropdown')) {
            hideEmployeeDropdown();
        }
    });
    
    // Week date events
    document.getElementById('week-start-date').addEventListener('change', updateWeekPeriodDisplay);
    document.getElementById('week-end-date').addEventListener('change', updateWeekPeriodDisplay);
    
    // Timecard input events
    timecardBody.addEventListener('input', function(e) {
        if (e.target.classList.contains('start-hour') || 
            e.target.classList.contains('start-minute') ||
            e.target.classList.contains('start-ampm') ||
            e.target.classList.contains('end-hour') ||
            e.target.classList.contains('end-minute') ||
            e.target.classList.contains('end-ampm') ||
            e.target.classList.contains('break-deduction')) {
            const dayIndex = parseInt(e.target.dataset.day);
            calculateDayTotal(dayIndex);
            calculateAll();
        }
    });
    
    // Change events for select dropdowns
    timecardBody.addEventListener('change', function(e) {
        if (e.target.classList.contains('start-ampm') ||
            e.target.classList.contains('end-ampm')) {
            const dayIndex = parseInt(e.target.dataset.day);
            calculateDayTotal(dayIndex);
            calculateAll();
        }
    });
}

// Initialize with sample data
function initializeSampleData() {
    for (let i = 0; i < 5; i++) {
        const row = timecardBody.children[i];
        row.querySelector('.start-hour').value = '6';
        row.querySelector('.start-minute').value = '00';
        row.querySelector('.start-ampm').value = 'AM';
        row.querySelector('.end-hour').value = '11';
        row.querySelector('.end-minute').value = '00';
        row.querySelector('.end-ampm').value = 'AM';
    }
    calculateAll();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTable();
    setupEventListeners();
    initializeSampleData();
    
    // Set default employee name
    const defaultEmployees = employeeManager.getEmployees();
    if (defaultEmployees.length > 0) {
        employeeInput.value = defaultEmployees[0];
    }
    
    // Initialize week period display
    updateWeekPeriodDisplay();
    
    // Set default dates (current week)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    document.getElementById('week-start-date').value = monday.toISOString().split('T')[0];
    document.getElementById('week-end-date').value = sunday.toISOString().split('T')[0];
    updateWeekPeriodDisplay();
    
    // Populate week period dropdown for reports
    populateWeekPeriodDropdown();
});
