// API Configuration
const API_URL = "https://scheduling-api.s2s.ph/api/admin/login";
const CREDENTIALS = {
    username: "superadmin",
    password: "cpSb4pBnsqCWIX3"
};

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const nameFilter = document.getElementById('nameFilter');
const designationFilter = document.getElementById('designationFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Global data storage
let employeeData = null;
let filteredData = null;

// Load data on page load
window.addEventListener('load', async function() {
    await loadDashboardData();
});

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: CREDENTIALS.username,
                password: CREDENTIALS.password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === true) {
            employeeData = data.data;
            renderTable(employeeData);
        } else {
            throw new Error(data.message || 'Failed to load data');
        }
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="100%" style="color: #ff5f56; text-align: center;">Error loading data: ' + error.message + '</td></tr>';
    }
}

// Logout Handler
logoutBtn.addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Scheduling Menu Handler
const schedulingMenu = document.getElementById('schedulingMenu');
schedulingMenu.addEventListener('click', function() {
    window.location.href = 'scheduling.html';
});

// Render Table Function
function renderTable(data) {
    if (!data || !data.headers || !data.employees) {
        tableBody.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
        return;
    }
    
    // Store current data for filtering
    filteredData = data.employees;
    
    // Render headers
    renderHeaders(data.headers);
    
    // Render body
    renderTableBody(filteredData);
}

function renderHeaders(headers) {
    const headerRow = document.createElement('tr');
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    tableHeader.innerHTML = '';
    tableHeader.appendChild(headerRow);
}

function renderTableBody(employees) {
    tableBody.innerHTML = '';
    
    if (!employees || employees.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 100;
        cell.textContent = 'No employees found';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        
        // Employee Name
        const nameCell = document.createElement('td');
        nameCell.textContent = employee.fullName;
        row.appendChild(nameCell);
        
        // Department
        const deptCell = document.createElement('td');
        deptCell.textContent = employee.department;
        row.appendChild(deptCell);
        
        // Designation
        const desigCell = document.createElement('td');
        desigCell.textContent = employee.designation;
        row.appendChild(desigCell);
        
        // Schedule dates (dynamically based on schedules)
        employee.schedules.forEach(schedule => {
            const schedCell = document.createElement('td');
            schedCell.className = 'schedule-cell';
            
            if (schedule.leave) {
                schedCell.textContent = schedule.timeLabel || 'Leave';
                schedCell.className += ' leave';
            } else if (schedule.holiday) {
                schedCell.textContent = 'Holiday';
                schedCell.className += ' holiday';
            } else if (schedule.dayoff) {
                schedCell.textContent = 'Day Off';
                schedCell.className += ' dayoff';
            } else if (schedule.hasSchedule) {
                schedCell.textContent = schedule.timeLabel || 'Scheduled';
                schedCell.className += ' has-schedule';
            } else {
                schedCell.textContent = '-';
            }
            
            row.appendChild(schedCell);
        });
        
        // Summary columns
        const summary = employee.summary;
        
        // Absent
        const absentCell = document.createElement('td');
        absentCell.textContent = summary.noOfAbsent;
        absentCell.className = 'summary-cell';
        row.appendChild(absentCell);
        
        // Min Late
        const lateCell = document.createElement('td');
        lateCell.textContent = summary.noOfMinuteLate;
        lateCell.className = 'summary-cell';
        row.appendChild(lateCell);
        
        // Hour Leave
        const hourLeaveCell = document.createElement('td');
        hourLeaveCell.textContent = summary.noOfHourLate;
        hourLeaveCell.className = 'summary-cell';
        row.appendChild(hourLeaveCell);
        
        // Working Hours
        const workHoursCell = document.createElement('td');
        workHoursCell.textContent = summary.workingHours;
        workHoursCell.className = 'summary-cell';
        row.appendChild(workHoursCell);
        
        // OT
        const otCell = document.createElement('td');
        otCell.textContent = summary.ot;
        otCell.className = 'summary-cell';
        row.appendChild(otCell);
        
        // Holiday
        const holidayCell = document.createElement('td');
        holidayCell.textContent = summary.holiday;
        holidayCell.className = 'summary-cell';
        row.appendChild(holidayCell);
        
        // Leave
        const leaveCell = document.createElement('td');
        leaveCell.textContent = summary.leave;
        leaveCell.className = 'summary-cell';
        row.appendChild(leaveCell);
        
        tableBody.appendChild(row);
    });
}

// Filter Functionality
function applyFilters() {
    if (!employeeData || !employeeData.employees) return;
    
    const nameFilterValue = nameFilter.value.toLowerCase().trim();
    const designationFilterValue = designationFilter.value.toLowerCase().trim();
    
    filteredData = employeeData.employees.filter(employee => {
        const matchesName = nameFilterValue === '' || 
            employee.fullName.toLowerCase().includes(nameFilterValue);
        const matchesDesignation = designationFilterValue === '' || 
            employee.designation.toLowerCase().includes(designationFilterValue);
        
        return matchesName && matchesDesignation;
    });
    
    renderTableBody(filteredData);
}

// Filter event listeners
nameFilter.addEventListener('input', applyFilters);
designationFilter.addEventListener('input', applyFilters);

clearFiltersBtn.addEventListener('click', function() {
    nameFilter.value = '';
    designationFilter.value = '';
    applyFilters();
});
