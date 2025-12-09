// API Configuration
const API_URL = "https://scheduling-api.s2s.ph/api/admin/employee";
const LOGIN_API_URL = "https://scheduling-api.s2s.ph/api/admin/login";
const CREDENTIALS = {
    username: "superadmin",
    password: "cpSb4pBnsqCWIX3"
};

// Date formatting utility
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        
        return `${month} ${day}, ${year}`;
    } catch (e) {
        return dateString; // Return original if error
    }
}

// Job Status lookup data
const jobStatusLookup = {
    7: 'Active',
    13: 'Casual',
    12: 'Commission Based',
    3: 'Consultant',
    4: 'Contractual',
    11: 'Part Time',
    6: 'Probationary',
    5: 'Project Based',
    1: 'Regular',
    8: 'Resigned'
};

// Department lookup data
const departmentLookup = {
    40: 'Admin',
    46: 'Back-office Support',
    38: 'Finance and Admin',
    33: 'HR and Admin',
    37: 'Hub',
    39: 'Install/Cabling Team',
    42: 'Order Management',
    45: 'Repair',
    35: 'Sales and Marketing',
    36: 'Service Fulfillment',
    47: 'Supply Chain Management',
    34: 'Technical',
    43: 'Training and Development',
    41: 'Warehouse'
};

// Designation lookup data
const designationLookup = {
    62: 'Accounting Assistant',
    24: 'Accounting officer',
    42: 'Accounting Supervisor',
    60: 'Admin Support Personnel',
    34: 'Administrative Assistant',
    45: 'Area Sales Head',
    43: 'Brand Ambassador',
    22: 'Chief Marketing Officer',
    50: 'Compliance Officer',
    17: 'CS Head',
    19: 'Customer Service Representative',
    33: 'Dealer Sales Coordinator',
    7: 'Developer',
    32: 'Dispatch Coordinator',
    38: 'Dispatch Manager',
    55: 'Dispatch Officer',
    37: 'Dispatch Supervisor',
    49: 'Dormancy Protection Manager',
    27: 'Driver',
    44: 'Driver Technician',
    52: 'Driver Technician',
    28: 'Driver/Installer',
    63: 'Facilities Attendant',
    4: 'Finance Assistant',
    3: 'Finance Head',
    15: 'Graphic Designer',
    47: 'Helpdesk',
    64: 'HR Generalist',
    1: 'HR Head',
    65: 'HR Payroll Specialist',
    2: 'HR Staff',
    25: 'Installer',
    57: 'Inventory Analyst',
    61: 'Inventory Clerk',
    26: 'IT Helpdesk',
    39: 'Junior Programmer',
    54: 'Junior Software Quality Assurance',
    10: 'Network Admin',
    23: 'Office Helper',
    46: 'Operations Manager',
    41: 'Order Fulfillment',
    58: 'Partner Material Management',
    40: 'Procurement',
    8: 'QA',
    5: 'QA Head',
    59: 'QA Manager',
    18: 'QA/Trainer',
    51: 'Retention Specialist',
    36: 'Rider Technician',
    21: 'Sales and Marketing',
    14: 'Sales Associate',
    12: 'Sales Manager',
    13: 'Sales Support',
    11: 'Site Acquisition Officer',
    20: 'Site Acquisition Specialist',
    9: 'Software Developer',
    6: 'Team Leader',
    30: 'Team Leader/Installer',
    31: 'Technical Support',
    56: 'Technical Support PR /Supervisor',
    48: 'Technical Trainor',
    16: 'Technical Writer',
    53: 'Technician',
    35: 'Training Officer',
    29: 'Warehouse Staff'
};

// DOM Elements
const employeesContainer = document.getElementById('employeesContainer');
const homeBtn = document.getElementById('homeBtn');
const modal = document.getElementById('employeeModal');
const closeBtn = document.querySelector('.close-btn');
const modalBody = document.getElementById('modalBody');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Filter elements
const nameFilterBtn = document.getElementById('nameFilterBtn');
const nameFilterPanel = document.getElementById('nameFilterPanel');
const nameFilterLabel = document.getElementById('nameFilterLabel');
const nameSearch = document.getElementById('nameSearch');
const nameOptions = document.getElementById('nameOptions');
const clearName = document.getElementById('clearName');
const applyName = document.getElementById('applyName');

const departmentFilterBtn = document.getElementById('departmentFilterBtn');
const departmentFilterPanel = document.getElementById('departmentFilterPanel');
const departmentFilterLabel = document.getElementById('departmentFilterLabel');
const departmentSearch = document.getElementById('departmentSearch');
const departmentOptions = document.getElementById('departmentOptions');
const clearDepartment = document.getElementById('clearDepartment');
const applyDepartment = document.getElementById('applyDepartment');

const designationFilterBtn = document.getElementById('designationFilterBtn');
const designationFilterPanel = document.getElementById('designationFilterPanel');
const designationFilterLabel = document.getElementById('designationFilterLabel');
const designationSearch = document.getElementById('designationSearch');
const designationOptions = document.getElementById('designationOptions');
const clearDesignation = document.getElementById('clearDesignation');
const applyDesignation = document.getElementById('applyDesignation');

const supervisorFilterBtn = document.getElementById('supervisorFilterBtn');
const supervisorFilterPanel = document.getElementById('supervisorFilterPanel');
const supervisorFilterLabel = document.getElementById('supervisorFilterLabel');
const supervisorSearch = document.getElementById('supervisorSearch');
const supervisorOptions = document.getElementById('supervisorOptions');
const clearSupervisor = document.getElementById('clearSupervisor');
const applySupervisor = document.getElementById('applySupervisor');

const saveFilterBtn = document.getElementById('saveFilterBtn');
const loadFilterBtn = document.getElementById('loadFilterBtn');
const savedFiltersPanel = document.getElementById('savedFiltersPanel');
const savedFiltersList = document.getElementById('savedFiltersList');
const exportBtn = document.getElementById('exportBtn');

let allEmployees = [];
let filteredEmployees = [];
let selectedNames = [];
let selectedDepartments = [];
let selectedDesignations = [];
let selectedSupervisors = [];
let savedFilters = [];

// Navigate home
homeBtn.addEventListener('click', function() {
    window.location.href = 'dashboard.html';
});

// Load saved filters from localStorage
function loadSavedFilters() {
    const saved = localStorage.getItem('employeeFilterViews');
    if (saved) {
        savedFilters = JSON.parse(saved);
        renderSavedFiltersList();
    }
}

// Save current filter view
saveFilterBtn.addEventListener('click', function() {
    const filterName = prompt('Enter a name for this filter view:');
    if (!filterName) return;
    
    const filterView = {
        id: Date.now(),
        name: filterName,
        sort: sortSelect.value,
        names: [...selectedNames],
        departments: [...selectedDepartments],
        designations: [...selectedDesignations],
        supervisors: [...selectedSupervisors],
        search: searchInput.value
    };
    
    savedFilters.push(filterView);
    localStorage.setItem('employeeFilterViews', JSON.stringify(savedFilters));
    renderSavedFiltersList();
    alert('Filter view saved successfully!');
});

// Toggle saved filters panel
loadFilterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    savedFiltersPanel.classList.toggle('show');
    loadFilterBtn.classList.toggle('active');
});

// Prevent panel from closing when clicking inside
savedFiltersPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Render saved filters list
function renderSavedFiltersList() {
    if (savedFilters.length === 0) {
        savedFiltersList.innerHTML = '<div style="padding: 10px; color: var(--border-color); font-size: 12px;">No saved filters</div>';
        return;
    }
    
    savedFiltersList.innerHTML = savedFilters.map(filter => `
        <div class="saved-filter-item">
            <span class="saved-filter-name" data-filter-id="${filter.id}">${filter.name}</span>
            <span class="delete-filter" data-filter-id="${filter.id}">✕</span>
        </div>
    `).join('');
    
    // Add click handlers
    savedFiltersList.querySelectorAll('.saved-filter-name').forEach(item => {
        item.addEventListener('click', function() {
            const filterId = parseInt(this.getAttribute('data-filter-id'));
            loadFilterView(filterId);
        });
    });
    
    savedFiltersList.querySelectorAll('.delete-filter').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const filterId = parseInt(this.getAttribute('data-filter-id'));
            deleteFilterView(filterId);
        });
    });
}

// Load a saved filter view
function loadFilterView(filterId) {
    const filter = savedFilters.find(f => f.id === filterId);
    if (!filter) return;
    
    // Restore sort
    sortSelect.value = filter.sort;
    
    // Restore search
    searchInput.value = filter.search || '';
    
    // Restore name filter
    selectedNames = [...filter.names];
    const nameCheckboxes = nameOptions.querySelectorAll('.name-checkbox');
    nameCheckboxes.forEach(cb => {
        cb.checked = selectedNames.includes(cb.value);
    });
    updateFilterLabel('name');
    
    // Restore department filter
    selectedDepartments = [...filter.departments];
    const deptCheckboxes = departmentOptions.querySelectorAll('.department-checkbox');
    deptCheckboxes.forEach(cb => {
        cb.checked = selectedDepartments.includes(cb.value);
    });
    updateFilterLabel('department');
    
    // Restore designation filter
    selectedDesignations = [...filter.designations];
    const desigCheckboxes = designationOptions.querySelectorAll('.designation-checkbox');
    desigCheckboxes.forEach(cb => {
        cb.checked = selectedDesignations.includes(cb.value);
    });
    updateFilterLabel('designation');
    
    // Restore supervisor filter
    selectedSupervisors = [...(filter.supervisors || [])];
    const supervisorCheckboxes = supervisorOptions.querySelectorAll('.supervisor-checkbox');
    supervisorCheckboxes.forEach(cb => {
        cb.checked = selectedSupervisors.includes(cb.value);
    });
    updateFilterLabel('supervisor');
    
    // Update designation options based on departments
    updateDesignationFilterOptions();
    
    // Close panel and apply filters
    savedFiltersPanel.classList.remove('show');
    loadFilterBtn.classList.remove('active');
    applyFiltersAndSort();
}

// Delete a saved filter view
function deleteFilterView(filterId) {
    if (!confirm('Delete this saved filter view?')) return;
    
    savedFilters = savedFilters.filter(f => f.id !== filterId);
    localStorage.setItem('employeeFilterViews', JSON.stringify(savedFilters));
    renderSavedFiltersList();
}

// Export filtered view to CSV
exportBtn.addEventListener('click', function() {
    if (filteredEmployees.length === 0) {
        alert('No employees to export');
        return;
    }
    
    // Prepare CSV headers
    const headers = [
        'Employee ID',
        'Full Name',
        'Department',
        'Designation',
        'Address',
        'City',
        'Province',
        'Region',
        'Birthday',
        'Age',
        'Gender',
        'Civil Status',
        'Mobile Number',
        'Email',
        'Job Status',
        'Start Date',
        'TIN',
        'SSS',
        'PhilHealth',
        'Pag-IBIG'
    ];
    
    // Prepare CSV rows
    const rows = filteredEmployees.map(employee => {
        const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim();
        const jobInfo = employee.jobInformation || {};
        const govId = employee.governmentId || {};
        
        // Calculate age
        let age = '';
        if (employee.birthday) {
            const birthDate = new Date(employee.birthday);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        
        return [
            employee.employeeId || '',
            fullName,
            departmentLookup[jobInfo.departmentId] || '',
            designationLookup[jobInfo.designationId] || '',
            employee.address || '',
            employee.city || '',
            employee.province || '',
            employee.region || '',
            formatDate(employee.birthday) || '',
            age,
            employee.gender || '',
            employee.civilStatus || '',
            employee.mobileNumber || '',
            employee.emailAddress || '',
            jobStatusLookup[jobInfo.jobStatusId] || '',
            formatDate(jobInfo.startDate) || '',
            govId.tin || '',
            govId.sss || '',
            govId.philhealth || '',
            govId.pagibig || ''
        ];
    });
    
    // Create CSV content
    let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Excel-style filter functionality
function populateFilters() {
    // Populate name filter options
    const names = allEmployees
        .map(emp => {
            const fullName = `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
            return { id: emp.employeeId, name: fullName };
        })
        .filter(item => item.name)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    nameOptions.innerHTML = `
        <div class="filter-select-all" id="selectAllNames">
            <input type="checkbox" id="selectAllNamesCheckbox">
            <label for="selectAllNamesCheckbox" style="cursor: pointer; flex: 1;">Select All</label>
        </div>
    ` + names.map(item => `
        <div class="filter-option" data-id="${item.id}" data-type="name">
            <input type="checkbox" id="name-${item.id}" value="${item.id}" class="name-checkbox">
            <label for="name-${item.id}" style="cursor: pointer; flex: 1;">${item.name}</label>
        </div>
    `).join('');
    
    // Populate department filter options
    const departments = Object.entries(departmentLookup)
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    
    departmentOptions.innerHTML = `
        <div class="filter-select-all" id="selectAllDepartments">
            <input type="checkbox" id="selectAllDepartmentsCheckbox">
            <label for="selectAllDepartmentsCheckbox" style="cursor: pointer; flex: 1;">Select All</label>
        </div>
    ` + departments.map(dept => `
        <div class="filter-option" data-id="${dept.id}" data-type="department">
            <input type="checkbox" id="dept-${dept.id}" value="${dept.id}" class="department-checkbox">
            <label for="dept-${dept.id}" style="cursor: pointer; flex: 1;">${dept.name}</label>
        </div>
    `).join('');
    
    // Populate designation filter options
    const designations = Object.entries(designationLookup)
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    
    designationOptions.innerHTML = `
        <div class="filter-select-all" id="selectAllDesignations">
            <input type="checkbox" id="selectAllDesignationsCheckbox">
            <label for="selectAllDesignationsCheckbox" style="cursor: pointer; flex: 1;">Select All</label>
        </div>
    ` + designations.map(desig => `
        <div class="filter-option" data-id="${desig.id}" data-type="designation">
            <input type="checkbox" id="desig-${desig.id}" value="${desig.id}" class="designation-checkbox">
            <label for="desig-${desig.id}" style="cursor: pointer; flex: 1;">${desig.name}</label>
        </div>
    `).join('');
    
    // Populate supervisor filter options - unique supervisors from employee data
    const supervisors = allEmployees
        .filter(emp => emp.supervisorId)
        .map(emp => {
            const supervisor = allEmployees.find(e => e._id === emp.supervisorId);
            if (supervisor) {
                const fullName = `${supervisor.firstName || ''} ${supervisor.middleName || ''} ${supervisor.lastName || ''}`.trim();
                return { id: supervisor._id, name: fullName };
            }
            return null;
        })
        .filter(item => item !== null)
        .filter((item, index, self) => self.findIndex(t => t.id === item.id) === index) // Remove duplicates
        .sort((a, b) => a.name.localeCompare(b.name));
    
    supervisorOptions.innerHTML = `
        <div class="filter-select-all" id="selectAllSupervisors">
            <input type="checkbox" id="selectAllSupervisorsCheckbox">
            <label for="selectAllSupervisorsCheckbox" style="cursor: pointer; flex: 1;">Select All</label>
        </div>
    ` + supervisors.map(sup => `
        <div class="filter-option" data-id="${sup.id}" data-type="supervisor">
            <input type="checkbox" id="sup-${sup.id}" value="${sup.id}" class="supervisor-checkbox">
            <label for="sup-${sup.id}" style="cursor: pointer; flex: 1;">${sup.name}</label>
        </div>
    `).join('');
    
    // Add click handlers to filter options
    addFilterOptionHandlers();
    addSelectAllHandlers();
}

// Add click handlers to filter options
function addFilterOptionHandlers() {
    // Name filter options
    const nameOpts = nameOptions.querySelectorAll('.filter-option');
    nameOpts.forEach(option => {
        option.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
        });
    });
    
    // Department filter options
    const deptOptions = departmentOptions.querySelectorAll('.filter-option');
    deptOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
        });
    });
    
    // Designation filter options
    const desigOptions = designationOptions.querySelectorAll('.filter-option');
    desigOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
        });
    });
    
    // Supervisor filter options
    const supOptions = supervisorOptions.querySelectorAll('.filter-option');
    supOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

// Add select all handlers
function addSelectAllHandlers() {
    // Select all names
    const selectAllNames = document.getElementById('selectAllNames');
    const selectAllNamesCheckbox = document.getElementById('selectAllNamesCheckbox');
    
    selectAllNames.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT') {
            selectAllNamesCheckbox.checked = !selectAllNamesCheckbox.checked;
        }
        const checkboxes = nameOptions.querySelectorAll('.name-checkbox');
        const visibleCheckboxes = Array.from(checkboxes).filter(cb => cb.closest('.filter-option').style.display !== 'none');
        visibleCheckboxes.forEach(cb => cb.checked = selectAllNamesCheckbox.checked);
    });
    
    // Select all departments
    const selectAllDepartments = document.getElementById('selectAllDepartments');
    const selectAllDepartmentsCheckbox = document.getElementById('selectAllDepartmentsCheckbox');
    
    selectAllDepartments.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT') {
            selectAllDepartmentsCheckbox.checked = !selectAllDepartmentsCheckbox.checked;
        }
        const checkboxes = departmentOptions.querySelectorAll('.department-checkbox');
        const visibleCheckboxes = Array.from(checkboxes).filter(cb => cb.closest('.filter-option').style.display !== 'none');
        visibleCheckboxes.forEach(cb => cb.checked = selectAllDepartmentsCheckbox.checked);
    });
    
    // Select all designations
    const selectAllDesignations = document.getElementById('selectAllDesignations');
    const selectAllDesignationsCheckbox = document.getElementById('selectAllDesignationsCheckbox');
    
    selectAllDesignations.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT') {
            selectAllDesignationsCheckbox.checked = !selectAllDesignationsCheckbox.checked;
        }
        const checkboxes = designationOptions.querySelectorAll('.designation-checkbox');
        const visibleCheckboxes = Array.from(checkboxes).filter(cb => cb.closest('.filter-option').style.display !== 'none');
        visibleCheckboxes.forEach(cb => cb.checked = selectAllDesignationsCheckbox.checked);
    });
    
    // Select all supervisors
    const selectAllSupervisors = document.getElementById('selectAllSupervisors');
    const selectAllSupervisorsCheckbox = document.getElementById('selectAllSupervisorsCheckbox');
    
    selectAllSupervisors.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT') {
            selectAllSupervisorsCheckbox.checked = !selectAllSupervisorsCheckbox.checked;
        }
        const checkboxes = supervisorOptions.querySelectorAll('.supervisor-checkbox');
        const visibleCheckboxes = Array.from(checkboxes).filter(cb => cb.closest('.filter-option').style.display !== 'none');
        visibleCheckboxes.forEach(cb => cb.checked = selectAllSupervisorsCheckbox.checked);
    });
}

// Toggle filter panels
nameFilterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    nameFilterPanel.classList.toggle('show');
    departmentFilterPanel.classList.remove('show');
    designationFilterPanel.classList.remove('show');
    nameFilterBtn.classList.toggle('active');
    departmentFilterBtn.classList.remove('active');
    designationFilterBtn.classList.remove('active');
});

departmentFilterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    departmentFilterPanel.classList.toggle('show');
    nameFilterPanel.classList.remove('show');
    designationFilterPanel.classList.remove('show');
    departmentFilterBtn.classList.toggle('active');
    nameFilterBtn.classList.remove('active');
    designationFilterBtn.classList.remove('active');
});

designationFilterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    designationFilterPanel.classList.toggle('show');
    nameFilterPanel.classList.remove('show');
    departmentFilterPanel.classList.remove('show');
    supervisorFilterPanel.classList.remove('show');
    designationFilterBtn.classList.toggle('active');
    nameFilterBtn.classList.remove('active');
    departmentFilterBtn.classList.remove('active');
    supervisorFilterBtn.classList.remove('active');
});

supervisorFilterBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    supervisorFilterPanel.classList.toggle('show');
    nameFilterPanel.classList.remove('show');
    departmentFilterPanel.classList.remove('show');
    designationFilterPanel.classList.remove('show');
    supervisorFilterBtn.classList.toggle('active');
    nameFilterBtn.classList.remove('active');
    departmentFilterBtn.classList.remove('active');
    designationFilterBtn.classList.remove('active');
});

// Close filter panels when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.filter-dropdown')) {
        nameFilterPanel.classList.remove('show');
        departmentFilterPanel.classList.remove('show');
        designationFilterPanel.classList.remove('show');
        supervisorFilterPanel.classList.remove('show');
        savedFiltersPanel.classList.remove('show');
        nameFilterBtn.classList.remove('active');
        departmentFilterBtn.classList.remove('active');
        designationFilterBtn.classList.remove('active');
        supervisorFilterBtn.classList.remove('active');
        loadFilterBtn.classList.remove('active');
    }
});

// Prevent panel from closing when clicking inside
nameFilterPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

departmentFilterPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

designationFilterPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

supervisorFilterPanel.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Name filter search
nameSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const options = nameOptions.querySelectorAll('.filter-option');
    
    options.forEach(option => {
        const label = option.querySelector('label').textContent.toLowerCase();
        option.style.display = label.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Department filter search
departmentSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const options = departmentOptions.querySelectorAll('.filter-option');
    
    options.forEach(option => {
        const label = option.querySelector('label').textContent.toLowerCase();
        option.style.display = label.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Designation filter search
designationSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const options = designationOptions.querySelectorAll('.filter-option');
    
    options.forEach(option => {
        const label = option.querySelector('label').textContent.toLowerCase();
        option.style.display = label.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Supervisor filter search
supervisorSearch.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const options = supervisorOptions.querySelectorAll('.filter-option');
    
    options.forEach(option => {
        const label = option.querySelector('label').textContent.toLowerCase();
        option.style.display = label.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Clear name filter
clearName.addEventListener('click', function() {
    const checkboxes = nameOptions.querySelectorAll('.name-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    selectedNames = [];
    updateFilterLabel('name');
});

// Apply name filter
applyName.addEventListener('click', function() {
    const checkboxes = nameOptions.querySelectorAll('.name-checkbox:checked');
    selectedNames = Array.from(checkboxes).map(cb => cb.value);
    updateFilterLabel('name');
    nameFilterPanel.classList.remove('show');
    nameFilterBtn.classList.remove('active');
    applyFiltersAndSort();
});

// Clear department filter
clearDepartment.addEventListener('click', function() {
    const checkboxes = departmentOptions.querySelectorAll('.department-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    selectedDepartments = [];
    updateFilterLabel('department');
    updateDesignationFilterOptions();
    updateNameFilterOptions();
});

// Apply department filter
applyDepartment.addEventListener('click', function() {
    const checkboxes = departmentOptions.querySelectorAll('.department-checkbox:checked');
    selectedDepartments = Array.from(checkboxes).map(cb => cb.value);
    updateFilterLabel('department');
    departmentFilterPanel.classList.remove('show');
    departmentFilterBtn.classList.remove('active');
    applyFiltersAndSort();
    updateDesignationFilterOptions();
    updateNameFilterOptions();
});

// Clear designation filter
clearDesignation.addEventListener('click', function() {
    const checkboxes = designationOptions.querySelectorAll('.designation-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    selectedDesignations = [];
    updateFilterLabel('designation');
    updateNameFilterOptions();
});

// Apply designation filter
applyDesignation.addEventListener('click', function() {
    const checkboxes = designationOptions.querySelectorAll('.designation-checkbox:checked');
    selectedDesignations = Array.from(checkboxes).map(cb => cb.value);
    updateFilterLabel('designation');
    designationFilterPanel.classList.remove('show');
    designationFilterBtn.classList.remove('active');
    applyFiltersAndSort();
    updateNameFilterOptions();
});

// Clear supervisor filter
clearSupervisor.addEventListener('click', function() {
    const checkboxes = supervisorOptions.querySelectorAll('.supervisor-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    selectedSupervisors = [];
    updateFilterLabel('supervisor');
});

// Apply supervisor filter
applySupervisor.addEventListener('click', function() {
    const checkboxes = supervisorOptions.querySelectorAll('.supervisor-checkbox:checked');
    selectedSupervisors = Array.from(checkboxes).map(cb => cb.value);
    updateFilterLabel('supervisor');
    supervisorFilterPanel.classList.remove('show');
    supervisorFilterBtn.classList.remove('active');
    applyFiltersAndSort();
});

// Update designation filter options based on selected departments
function updateDesignationFilterOptions() {
    if (selectedDepartments.length === 0) {
        // Show all designations
        const allOptions = designationOptions.querySelectorAll('.filter-option');
        allOptions.forEach(option => {
            option.style.display = 'flex';
        });
        return;
    }
    
    // Get unique designation IDs from employees in selected departments
    const availableDesignations = new Set();
    allEmployees.forEach(employee => {
        const jobInfo = employee.jobInformation || {};
        if (selectedDepartments.includes(String(jobInfo.departmentId))) {
            if (jobInfo.designationId) {
                availableDesignations.add(String(jobInfo.designationId));
            }
        }
    });
    
    // Show/hide designation options based on availability
    const allOptions = designationOptions.querySelectorAll('.filter-option');
    allOptions.forEach(option => {
        const designationId = option.getAttribute('data-id');
        if (availableDesignations.has(designationId)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
            // Uncheck if hidden
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                checkbox.checked = false;
            }
        }
    });
    
    // Update selected designations to remove any that are no longer available
    selectedDesignations = selectedDesignations.filter(id => availableDesignations.has(id));
    updateFilterLabel('designation');
}

// Update name filter options based on selected departments and designations
function updateNameFilterOptions() {
    if (selectedDepartments.length === 0 && selectedDesignations.length === 0) {
        // Show all names
        const allOptions = nameOptions.querySelectorAll('.filter-option');
        allOptions.forEach(option => {
            option.style.display = 'flex';
        });
        return;
    }
    
    // Get unique employee IDs from employees in selected departments/designations
    const availableNames = new Set();
    allEmployees.forEach(employee => {
        const jobInfo = employee.jobInformation || {};
        let matches = true;
        
        // Check department filter
        if (selectedDepartments.length > 0) {
            matches = matches && selectedDepartments.includes(String(jobInfo.departmentId));
        }
        
        // Check designation filter
        if (selectedDesignations.length > 0) {
            matches = matches && selectedDesignations.includes(String(jobInfo.designationId));
        }
        
        if (matches && employee.employeeId) {
            availableNames.add(String(employee.employeeId));
        }
    });
    
    // Show/hide name options based on availability
    const allOptions = nameOptions.querySelectorAll('.filter-option');
    allOptions.forEach(option => {
        const employeeId = option.getAttribute('data-id');
        if (availableNames.has(employeeId)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
            // Uncheck if hidden
            const checkbox = option.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                checkbox.checked = false;
            }
        }
    });
    
    // Update selected names to remove any that are no longer available
    selectedNames = selectedNames.filter(id => availableNames.has(id));
    updateFilterLabel('name');
}

// Update filter button labels
function updateFilterLabel(type) {
    if (type === 'name') {
        if (selectedNames.length === 0) {
            nameFilterLabel.textContent = 'Name';
        } else if (selectedNames.length === 1) {
            const employee = allEmployees.find(emp => emp.employeeId == selectedNames[0]);
            if (employee) {
                const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim();
                nameFilterLabel.textContent = fullName;
            }
        } else {
            nameFilterLabel.textContent = `Name (${selectedNames.length})`;
        }
    } else if (type === 'department') {
        if (selectedDepartments.length === 0) {
            departmentFilterLabel.textContent = 'Department';
        } else if (selectedDepartments.length === 1) {
            departmentFilterLabel.textContent = departmentLookup[selectedDepartments[0]];
        } else {
            departmentFilterLabel.textContent = `Department (${selectedDepartments.length})`;
        }
    } else if (type === 'designation') {
        if (selectedDesignations.length === 0) {
            designationFilterLabel.textContent = 'Designation';
        } else if (selectedDesignations.length === 1) {
            designationFilterLabel.textContent = designationLookup[selectedDesignations[0]];
        } else {
            designationFilterLabel.textContent = `Designation (${selectedDesignations.length})`;
        }
    } else if (type === 'supervisor') {
        if (selectedSupervisors.length === 0) {
            supervisorFilterLabel.textContent = 'Supervisor';
        } else if (selectedSupervisors.length === 1) {
            const supervisor = allEmployees.find(emp => emp._id === selectedSupervisors[0]);
            if (supervisor) {
                const fullName = `${supervisor.firstName || ''} ${supervisor.middleName || ''} ${supervisor.lastName || ''}`.trim();
                supervisorFilterLabel.textContent = fullName;
            }
        } else {
            supervisorFilterLabel.textContent = `Supervisor (${selectedSupervisors.length})`;
        }
    }
}

// Search functionality
searchInput.addEventListener('input', function(e) {
    applyFiltersAndSort();
});

// Sort functionality
sortSelect.addEventListener('change', function() {
    applySortAndRender();
});

function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    filteredEmployees = allEmployees.filter(employee => {
        const jobInfo = employee.jobInformation || {};
        
        // Apply name filter - if any names selected, employee must match one
        if (selectedNames.length > 0) {
            const nameMatch = selectedNames.some(empId => employee.employeeId == empId);
            if (!nameMatch) return false;
        }
        
        // Apply department filter - if any departments selected, employee must match one
        if (selectedDepartments.length > 0) {
            const deptMatch = selectedDepartments.some(deptId => jobInfo.departmentId == deptId);
            if (!deptMatch) return false;
        }
        
        // Apply designation filter - if any designations selected, employee must match one
        if (selectedDesignations.length > 0) {
            const designationMatch = selectedDesignations.some(desigId => jobInfo.designationId == desigId);
            if (!designationMatch) return false;
        }
        
        // Apply supervisor filter - if any supervisors selected, employee must match one
        if (selectedSupervisors.length > 0) {
            const supervisorMatch = selectedSupervisors.some(supId => employee.supervisorId === supId);
            if (!supervisorMatch) return false;
        }
        
        // Apply search filter
        if (searchTerm) {
            const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.toLowerCase();
            const employeeId = (employee.employeeId || '').toString().toLowerCase();
            const address = (employee.address || '').toLowerCase();
            
            const department = (departmentLookup[jobInfo.departmentId] || '').toLowerCase();
            const designation = (designationLookup[jobInfo.designationId] || '').toLowerCase();
            const jobStatus = (jobStatusLookup[jobInfo.jobStatusId] || '').toLowerCase();
            
            return fullName.includes(searchTerm) ||
                   employeeId.includes(searchTerm) ||
                   address.includes(searchTerm) ||
                   department.includes(searchTerm) ||
                   designation.includes(searchTerm) ||
                   jobStatus.includes(searchTerm);
        }
        
        return true;
    });
    
    applySortAndRender();
}

function applySortAndRender() {
    const sortValue = sortSelect.value;
    let sorted = [...filteredEmployees];
    
    switch(sortValue) {
        case 'name-asc':
            sorted.sort((a, b) => {
                const nameA = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''}`.trim().toLowerCase();
                const nameB = `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim().toLowerCase();
                return nameA.localeCompare(nameB);
            });
            break;
        case 'name-desc':
            sorted.sort((a, b) => {
                const nameA = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''}`.trim().toLowerCase();
                const nameB = `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim().toLowerCase();
                return nameB.localeCompare(nameA);
            });
            break;
        case 'id-asc':
            sorted.sort((a, b) => (a.employeeId || 0) - (b.employeeId || 0));
            break;
        case 'id-desc':
            sorted.sort((a, b) => (b.employeeId || 0) - (a.employeeId || 0));
            break;
        case 'department-asc':
            sorted.sort((a, b) => {
                const deptA = departmentLookup[(a.jobInformation || {}).departmentId] || '';
                const deptB = departmentLookup[(b.jobInformation || {}).departmentId] || '';
                return deptA.localeCompare(deptB);
            });
            break;
        case 'department-desc':
            sorted.sort((a, b) => {
                const deptA = departmentLookup[(a.jobInformation || {}).departmentId] || '';
                const deptB = departmentLookup[(b.jobInformation || {}).departmentId] || '';
                return deptB.localeCompare(deptA);
            });
            break;
        case 'age-asc':
            sorted.sort((a, b) => {
                const ageA = calculateAge(a.birthday);
                const ageB = calculateAge(b.birthday);
                return ageA - ageB;
            });
            break;
        case 'age-desc':
            sorted.sort((a, b) => {
                const ageA = calculateAge(a.birthday);
                const ageB = calculateAge(b.birthday);
                return ageB - ageA;
            });
            break;
    }
    
    renderEmployees(sorted);
}

function calculateAge(birthday) {
    if (!birthday) return 0;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Close modal handlers
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Load employees on page load
window.addEventListener('load', async function() {
    await loadEmployees();
    populateFilters();
    loadSavedFilters();
});

// Fetch and display employees
async function loadEmployees() {
    try {
        // First, authenticate to get token
        const authResponse = await fetch(LOGIN_API_URL, {
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
        
        const authData = await authResponse.json();
        
        if (!authResponse.ok || !authData.status || !authData.data || !authData.data.token) {
            throw new Error('Authentication failed');
        }
        
        const token = authData.data.token;
        
        // Now fetch employees with the token
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': token,
                'wsc-token': token
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === true) {
            // Handle the API response structure: data.data.employee
            let employeeList = data.data;
            
            // Check if it's nested under 'employee' property
            if (employeeList && employeeList.employee) {
                employeeList = employeeList.employee;
            }
            // Check if it's nested under 'employees' property
            else if (employeeList && employeeList.employees) {
                employeeList = employeeList.employees;
            }
            // If data.data is not an array, convert to array or handle as single employee
            if (!Array.isArray(employeeList)) {
                if (typeof employeeList === 'object' && employeeList !== null) {
                    employeeList = [employeeList];
                } else {
                    employeeList = [];
                }
            }
            
            allEmployees = employeeList;
            filteredEmployees = [...employeeList];
            applySortAndRender();
        } else {
            throw new Error(data.message || 'Failed to load employees');
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        employeesContainer.innerHTML = `<p class="error">Failed to load employees: ${error.message}</p>`;
    }
}

// Render employees as cards
function renderEmployees(employees) {
    if (!employees || employees.length === 0) {
        employeesContainer.innerHTML = '<p class="loading">No employees found</p>';
        return;
    }
    
    let html = '<div class="employee-grid">';
    
    employees.forEach((employee, index) => {
        const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.trim();
        const jobInfo = employee.jobInformation || {};
        
        // Get job status name from lookup
        const jobStatusId = jobInfo.jobStatusId;
        const jobStatus = jobStatusLookup[jobStatusId] || 'N/A';
        
        // Get department name from lookup
        const departmentId = jobInfo.departmentId;
        const department = departmentLookup[departmentId] || 'N/A';
        
        // Get designation name from lookup
        const designationId = jobInfo.designationId;
        const designation = designationLookup[designationId] || 'N/A';
        
        // Calculate age from birthday
        let age = 'N/A';
        if (employee.birthday) {
            const birthDate = new Date(employee.birthday);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        
        // Get supervisor name by looking up supervisorId in allEmployees
        let supervisorName = 'N/A';
        if (employee.supervisorId) {
            const supervisor = allEmployees.find(emp => emp._id === employee.supervisorId);
            if (supervisor) {
                supervisorName = `${supervisor.firstName || ''} ${supervisor.middleName || ''} ${supervisor.lastName || ''}`.trim();
            }
        }
        
        html += `
            <div class="employee-card" onclick="showEmployeeDetails(${index})">
                <h3>${fullName || 'N/A'}</h3>
                <p><span class="label">Employee ID:</span> <span class="value">${employee.employeeId || 'N/A'}</span></p>
                <p><span class="label">Department:</span> <span class="value">${department}</span></p>
                <p><span class="label">Designation:</span> <span class="value">${designation}</span></p>
                <p><span class="label">Supervisor:</span> <span class="value">${supervisorName}</span></p>
                <p><span class="label">Address:</span> <span class="value">${employee.address || 'N/A'}</span></p>
                <p><span class="label">Birthday:</span> <span class="value">${formatDate(employee.birthday)}</span></p>
                <p><span class="label">Age:</span> <span class="value">${age}</span></p>
                <p><span class="label">Job Status:</span> <span class="value">${jobStatus}</span></p>
            </div>
        `;
    });
    
    html += '</div>';
    employeesContainer.innerHTML = html;
}

// Show employee details in modal
function showEmployeeDetails(index) {
    const employee = allEmployees[index];
    if (!employee) return;
    
    const fullName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''} ${employee.suffix || ''}`.trim();
    const jobInfo = employee.jobInformation || {};
    const govId = employee.governmentId || {};
    const emergency = employee.emergencyContactDetails || {};
    const bank = employee.bankDetails || {};
    const empHistory = employee.employmentHistory || {};
    
    // Set employee name in modal header
    document.getElementById('modalEmployeeName').textContent = fullName || 'Employee Details';
    
    let html = '';
    
    // Personal Information
    html += `
        <div class="detail-section">
            <h3>Personal Information</h3>
            <div class="detail-row">
                <div class="detail-label">Employee ID:</div>
                <div class="detail-value">${employee.employeeId || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Birthday:</div>
                <div class="detail-value">${formatDate(employee.birthday)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Place of Birth:</div>
                <div class="detail-value">${employee.placeOfBirth || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Gender:</div>
                <div class="detail-value">${employee.gender || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Civil Status:</div>
                <div class="detail-value">${employee.civilStatus || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Citizenship:</div>
                <div class="detail-value">${employee.citizenship || 'N/A'}</div>
            </div>
        </div>
    `;
    
    // Contact Information
    html += `
        <div class="detail-section">
            <h3>Contact Information</h3>
            <div class="detail-row">
                <div class="detail-label">Address:</div>
                <div class="detail-value">${employee.address || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">City:</div>
                <div class="detail-value">${employee.city || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Province:</div>
                <div class="detail-value">${employee.province || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Region:</div>
                <div class="detail-value">${employee.region || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Mobile Number:</div>
                <div class="detail-value">${employee.mobileNumber || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Phone Number:</div>
                <div class="detail-value">${employee.phoneNumber || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${employee.emailAddress || 'N/A'}</div>
            </div>
        </div>
    `;
    
    // Emergency Contact
    html += `
        <div class="detail-section">
            <h3>Emergency Contact</h3>
            <div class="detail-row">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${emergency.name || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Mobile Number:</div>
                <div class="detail-value">${emergency.mobileNumber || 'N/A'}</div>
            </div>
        </div>
    `;
    
    // Government IDs
    html += `
        <div class="detail-section">
            <h3>Government IDs</h3>
            <div class="detail-row">
                <div class="detail-label">TIN:</div>
                <div class="detail-value">${govId.tin || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">SSS:</div>
                <div class="detail-value">${govId.sss || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">PhilHealth:</div>
                <div class="detail-value">${govId.philhealth || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Pag-IBIG:</div>
                <div class="detail-value">${govId.pagibig || 'N/A'}</div>
            </div>
        </div>
    `;
    
    // Job Information
    html += `
        <div class="detail-section">
            <h3>Job Information</h3>
            <div class="detail-row">
                <div class="detail-label">Department ID:</div>
                <div class="detail-value">${jobInfo.departmentId || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Designation ID:</div>
                <div class="detail-value">${jobInfo.designationId || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Start Date:</div>
                <div class="detail-value">${formatDate(jobInfo.startDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Regularization Date:</div>
                <div class="detail-value">${formatDate(jobInfo.regularizationDate)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Job Status ID:</div>
                <div class="detail-value">${jobInfo.jobStatusId || 'N/A'}</div>
            </div>
        </div>
    `;
    
    // Bank Details
    if (bank.name) {
        html += `
            <div class="detail-section">
                <h3>Bank Details</h3>
                <div class="detail-row">
                    <div class="detail-label">Bank Name:</div>
                    <div class="detail-value">${bank.name || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Account Name:</div>
                    <div class="detail-value">${bank.accountName || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Account Number:</div>
                    <div class="detail-value">${bank.accountNumber || 'N/A'}</div>
                </div>
            </div>
        `;
    }
    
    // Employment History
    if (empHistory.name) {
        html += `
            <div class="detail-section">
                <h3>Employment History</h3>
                <div class="detail-row">
                    <div class="detail-label">Company Name:</div>
                    <div class="detail-value">${empHistory.name || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Address:</div>
                    <div class="detail-value">${empHistory.address || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Last Date:</div>
                    <div class="detail-value">${formatDate(empHistory.lastDate)}</div>
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = html;
    modal.style.display = 'block';
}
