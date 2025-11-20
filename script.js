// ============================================
// Hostel Management System - Centralized JavaScript
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadHeaderFooter();
    applyHeaderOptions();
    initializeHeaderAssets();
    initializeNavbar();
    initializeActiveLinks();
    initializeDateUpdates();
    initializeFormValidations();
    initializeInteractiveElements();
    setupAuth();
    await loadMockData();
    renderDetailsPageByRole();
    renderRoomAllocationPageByRole();
});

// ============================================
// Header/Footer Injection
// ============================================
async function loadHeaderFooter() {
    try {
        const headerContainer = document.getElementById('header');
        const footerContainer = document.getElementById('footer');

        if (headerContainer) {
            const headerResp = await fetch('header.html', { cache: 'no-cache' });
            const headerHtml = await headerResp.text();
            headerContainer.innerHTML = headerHtml;
        }

        if (footerContainer) {
            const footerResp = await fetch('footer.html', { cache: 'no-cache' });
            const footerHtml = await footerResp.text();
            footerContainer.innerHTML = footerHtml;
        }
    } catch (err) {
        console.error('Failed to load header/footer:', err);
    }
}

// Apply header options like hiding navbar on specific pages
function applyHeaderOptions() {
    const noNavbar = document.body && document.body.getAttribute('data-no-navbar') === 'true';
    if (noNavbar) {
        const globalNavbar = document.getElementById('global-navbar');
        if (globalNavbar) globalNavbar.style.display = 'none';
        const quicklink = document.querySelector('.subheader-quicklink');
        if (quicklink) quicklink.style.display = 'none';
    }
}

function initializeHeaderAssets() {
    const setSrc = (id, src) => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    };

    setSrc('smvdu-logo', 'images/smvdu-logo.png');
    setSrc('tcs-accredited-logo', 'images/tcs-accredited.png');
    setSrc('facebook-logo', 'images/facebook-logo.png');
    setSrc('linkedin-icon', 'images/linkedin-icon.png');
    setSrc('x-icon', 'images/x-icon.png');
    setSrc('youtube-icon', 'images/youtube-icon.png');
    setSrc('instagram-icon', 'images/instagram-icon.png');

    // Auth controls (login/logout and role display)
    const authControls = document.getElementById('auth-controls');
    if (authControls) {
        const currentUser = getCurrentUser();
        if (currentUser) {
            authControls.innerHTML = `Signed in as ${currentUser.role} · <a href="#" id="logout-link" style="color:#ffcc00; text-decoration:none;">Logout</a>`;
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        } else {
            authControls.innerHTML = `<a href="index.html" style="color:#ffcc00; text-decoration:none;">Login</a>`;
        }
    }
}

// ============================================
// Navbar Functionality
// ============================================
function initializeNavbar() {
    // Mobile menu toggle
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = navbarToggle.querySelector('span') || navbarToggle;
            if (navbarMenu.classList.contains('active')) {
                icon.textContent = '✕';
            } else {
                icon.textContent = '☰';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar')) {
                navbarMenu.classList.remove('active');
                const icon = navbarToggle.querySelector('span') || navbarToggle;
                icon.textContent = '☰';
            }
        });
    }
}

// ============================================
// Active Navigation Links
// ============================================
function initializeActiveLinks() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if current page matches the link
        if (currentPath.endsWith(linkPath) || 
            (linkPath === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/index.html')))) {
            link.classList.add('active');
        }
        
        // Remove active class from other links
        if (!currentPath.endsWith(linkPath) && link.classList.contains('active')) {
            link.classList.remove('active');
        }
    });
}

// ============================================
// Date Updates
// ============================================
function initializeDateUpdates() {
    // Update last updated date in header
    const dateElement = document.getElementById('last-updated-date');
    if (dateElement) {
        const now = new Date();
        const day = now.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        
        // Add ordinal suffix to day
        const getOrdinal = (n) => {
            const s = ['th', 'st', 'nd', 'rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        
        dateElement.textContent = getOrdinal(day) + ' ' + month + ', ' + year;
    }
    
    // Update copyright year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ============================================
// Form Validations
// ============================================
function initializeFormValidations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(form)) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('invalid');
            showErrorMessage(input, 'This field is required');
        } else {
            input.classList.remove('invalid');
            removeErrorMessage(input);
            
            // Email validation
            if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                input.classList.add('invalid');
                showErrorMessage(input, 'Please enter a valid email address');
            }
            
            // Date validation
            if (input.type === 'date') {
                const inputDate = new Date(input.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // For gate pass, end date should be after start date
                if (input.name === 'end-date' || input.id === 'end-date') {
                    const startDateInput = form.querySelector('input[name="start-date"], input[id="start-date"]');
                    if (startDateInput && inputDate <= new Date(startDateInput.value)) {
                        isValid = false;
                        input.classList.add('invalid');
                        showErrorMessage(input, 'End date must be after start date');
                    }
                }
            }
        }
    });
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showErrorMessage(input, message) {
    removeErrorMessage(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

function removeErrorMessage(input) {
    const errorDiv = input.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// ============================================
// Interactive Elements
// ============================================
function initializeInteractiveElements() {
    // Initialize tooltips or any interactive elements
    initializeDeleteConfirmations();
    initializeModalDialogs();
    initializeSearchFunctionality();
}

// Delete confirmation dialogs
function initializeDeleteConfirmations() {
    const deleteButtons = document.querySelectorAll('.btn-delete, [data-action="delete"]');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            if (!confirm('Are you sure you want to delete this item?')) {
                event.preventDefault();
            }
        });
    });
}

// Modal dialogs
function initializeModalDialogs() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });
    
    modals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('.modal-close, .close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        });
        
        // Close on outside click
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Search functionality
function initializeSearchFunctionality() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const searchableItems = document.querySelectorAll('.searchable-item');
            
            searchableItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ============================================
// Utility Functions
// ============================================

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ============================================
// Authentication (Dummy)
// ============================================
function setupAuth() {
    // Protect pages except index.html
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('\\');
    const protectedPages = ['home.html','room-allocation.html','details.html','gate-pass.html','complaints.html','fee-details.html','noticeboard.html'];
    if (!isLoginPage) {
        const path = window.location.pathname.split('/').pop();
        if (protectedPages.includes(path) && !getCurrentUser()) {
            window.location.href = 'index.html';
            return;
        }
    }

    const authForm = document.getElementById('auth-form');
    const roleTabs = document.querySelectorAll('[data-role-tab]');
    const roleInput = document.getElementById('role-input');

    // Role tab switching
    if (roleTabs.length) {
        roleTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                roleTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const role = this.getAttribute('data-role-tab');
                if (roleInput) roleInput.value = role;
                // Toggle labels
                const idLabel = document.getElementById('id-label');
                if (idLabel) idLabel.textContent = role === 'student' ? 'Student ID' : 'Username';
            });
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const role = (roleInput && roleInput.value) || 'student';
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (authenticate(role, username, password)) {
                setCurrentUser({ role, username });
                showNotification('Login successful', 'success');
                setTimeout(() => { window.location.href = 'home.html'; }, 500);
            } else {
                showNotification('Invalid credentials. Please try again.', 'danger');
            }
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newId = document.getElementById('signup-id').value.trim();
            const newPass = document.getElementById('signup-password').value.trim();
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.username === newId)) {
                showNotification('Account already exists', 'warning');
                return;
            }
            users.push({ role: 'student', username: newId, password: newPass });
            localStorage.setItem('users', JSON.stringify(users));
            showNotification('Account created. You can log in now.', 'success');
        });
    }

    // Toggle Registration and Reset sections
    const btnShowRegistration = document.getElementById('btn-show-registration');
    const btnShowReset = document.getElementById('btn-show-reset');
    const registrationSection = document.getElementById('registration-section');
    const resetSection = document.getElementById('reset-section');

    if (btnShowRegistration && registrationSection) {
        btnShowRegistration.addEventListener('click', function() {
            registrationSection.hidden = false;
            if (resetSection) resetSection.hidden = true;
            // Scroll into view for better UX
            registrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (btnShowReset && resetSection) {
        btnShowReset.addEventListener('click', function() {
            resetSection.hidden = false;
            if (registrationSection) registrationSection.hidden = true;
            resetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('reset-id').value.trim();
            const newPass = document.getElementById('reset-new-password').value.trim();
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const idx = users.findIndex(u => u.username === id);
            if (idx === -1) {
                showNotification('No account found for that ID', 'warning');
                return;
            }
            users[idx].password = newPass;
            localStorage.setItem('users', JSON.stringify(users));
            showNotification('Password updated successfully', 'success');
        });
    }
}

function authenticate(role, username, password) {
    // Predefined demo accounts
    const studentPreset = { username: '23bcs060', password: 'Parag' };
    const adminAllowed = [
        { username: 'admin', password: 'admin' },
        // Legacy staff accounts treated under Admin role
        { username: 'kamaldeep', password: 'warden' },
        { username: 'anil', password: 'caretaker' }
    ];

    // Additional student preset
    if (role === 'student' && username === '23bcs077' && password === 'Rohit') {
        return true;
    }

    // Student preset
    if (role === 'student' && studentPreset.username === username && studentPreset.password === password) {
        return true;
    }

    // Admin presets (includes legacy warden/caretaker credentials)
    if (role === 'admin' && adminAllowed.some(acc => acc.username === username && acc.password === password)) {
        return true;
    }

    // Allow student accounts created via signup
    if (role === 'student') {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const match = users.find(u => u.username === username && u.password === password);
        if (match) return true;
    }
    return false;
}

function getCurrentUser() {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#003366'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts if needed
window.HostelManagement = {
    formatDate,
    formatCurrency,
    showNotification,
    validateForm,
    authenticate,
    getCurrentUser,
    logout
};

// ============================================
// Mock API Data Loader
// ============================================
const MockData = { rooms: [], hostels: {} };

async function loadMockData() {
    try {
        const [roomsRes, hostelsRes] = await Promise.all([
            fetch('api/rooms.json'),
            fetch('api/hostels.json')
        ]);
        if (roomsRes.ok) MockData.rooms = await roomsRes.json();
        if (hostelsRes.ok) MockData.hostels = await hostelsRes.json();
    } catch (e) {
        console.warn('Mock data fetch failed, using fallback.', e);
        // Fallback minimal data
        MockData.rooms = [
            { block: 'Block A', room: 101, occupants: [
                { id: '23bcs060', name: 'Parag', course: 'B.Tech CSE', year: '1st Year', email: 'parag@smvdu.ac.in', phone: '9876540000' },
                { id: 'STU2025001', name: 'Rajesh Kumar', course: 'B.Tech CSE', year: '3rd Year', email: 'rajesh.kumar@smvdu.ac.in', phone: '9876543210' }
            ] }
        ];
        MockData.hostels = { 'Block A': { name: 'AB Hostel', warden: 'Mr. Kamaldeep', contact: '8899988387', email: 'hostels@smvdu.ac.in', address: 'SMVDU Campus, Katra, J&K 182320' } };
    }
}

// ============================================
// Dummy Dataset: Rooms and Occupants
// ============================================
const DemoRooms = [
    {
        block: 'Block A', room: 101,
        occupants: [
            { id: '23bcs060', name: 'Parag', course: 'B.Tech CSE', year: '1st Year', email: 'parag@smvdu.ac.in', phone: '9876540000' },
            { id: 'STU2025001', name: 'Rajesh Kumar', course: 'B.Tech CSE', year: '3rd Year', email: 'rajesh.kumar@smvdu.ac.in', phone: '9876543210' }
        ]
    },
    {
        block: 'Block A', room: 102,
        occupants: [
            { id: 'STU2025002', name: 'Amit Sharma', course: 'B.Tech ECE', year: '3rd Year', email: 'amit.sharma@smvdu.ac.in', phone: '9876543211' }
        ]
    },
    {
        block: 'Block B', room: 201,
        occupants: [
            { id: 'STU2025003', name: 'Priya Patel', course: 'B.Tech ME', year: '2nd Year', email: 'priya.patel@smvdu.ac.in', phone: '9876543212' }
        ]
    },
    {
        block: 'Block A', room: 103,
        occupants: [
            { id: 'STU2025004', name: 'Vikram Singh', course: 'M.Tech CSE', year: '1st Year', email: 'vikram.singh@smvdu.ac.in', phone: '9876543213' }
        ]
    },
    {
        block: 'Block C', room: 301,
        occupants: [
            { id: 'STU2025005', name: 'Neha Gupta', course: 'MBA', year: '1st Year', email: 'neha.gupta@smvdu.ac.in', phone: '9876543214' }
        ]
    }
];

function findRoomByStudentId(studentId) {
    const id = (studentId || '').toLowerCase();
    const list = (MockData.rooms && MockData.rooms.length) ? MockData.rooms : DemoRooms;
    for (const r of list) {
        if (r.occupants.some(o => (o.id || '').toLowerCase() === id)) return r;
    }
    return null;
}

// ============================================
// Details Page Rendering by Role
// ============================================
function renderDetailsPageByRole() {
    const path = window.location.pathname.split('/').pop();
    if (path !== 'details.html') return;

    const user = getCurrentUser();
    const role = user?.role || null;

    const searchSection = document.getElementById('search-section');
    const studentTableSection = document.getElementById('student-table-section');
    const studentRoomSection = document.getElementById('student-room-section');
    const adminRoomsSection = document.getElementById('admin-rooms-section');
    const adminRoomDetailsSection = document.getElementById('admin-room-details-section');

    if (!role) {
        // If not logged in, already redirected by setupAuth; just in case
        return;
    }

    if (role === 'student') {
        // Student: show only their room and roommates
        if (searchSection) searchSection.style.display = 'none';
        if (studentTableSection) studentTableSection.style.display = 'none';
        if (adminRoomsSection) adminRoomsSection.style.display = 'none';
        if (adminRoomDetailsSection) adminRoomDetailsSection.style.display = 'none';
        if (studentRoomSection) studentRoomSection.style.display = '';
        const studentHostelSection = document.getElementById('student-hostel-section');
        const studentPersonalSection = document.getElementById('student-personal-section');
        const statsSection2 = document.getElementById('stats-section');
        const sampleProfileSection2 = document.getElementById('sample-profile-section');
        if (studentHostelSection) studentHostelSection.style.display = '';
        if (studentPersonalSection) studentPersonalSection.style.display = '';
        if (statsSection2) statsSection2.style.display = 'none';
        if (sampleProfileSection2) sampleProfileSection2.style.display = 'none';

        const room = findRoomByStudentId(user.username);
        const roomDetailsDiv = document.getElementById('student-room-details');
        const roommatesTbody = document.getElementById('student-roommates');
        if (roomDetailsDiv) {
            if (room) {
                roomDetailsDiv.innerHTML = `
                    <div><strong>Block:</strong> ${room.block}</div>
                    <div><strong>Room:</strong> ${room.room}</div>
                    <div><strong>Total Occupants:</strong> ${room.occupants.length}</div>
                `;
            } else {
                roomDetailsDiv.innerHTML = `<div style="color:#a00; font-weight:600;">Room not allotted yet.</div>`;
            }
        }
        // Populate hostel and personal details
        const hostelDetailsDiv = document.getElementById('student-hostel-details');
        const personalDetailsDiv = document.getElementById('student-personal-details');
        if (!room) {
            if (hostelDetailsDiv) hostelDetailsDiv.innerHTML = '';
            if (personalDetailsDiv) personalDetailsDiv.innerHTML = '';
        } else {
            const hostel = (MockData.hostels && MockData.hostels[room.block]) || null;
            if (hostelDetailsDiv) {
                hostelDetailsDiv.innerHTML = hostel ? `
                    <div><strong>Hostel Name:</strong> ${hostel.name}</div>
                    <div><strong>Warden:</strong> ${hostel.warden}</div>
                    <div><strong>Contact:</strong> ${hostel.contact}</div>
                    <div><strong>Email:</strong> ${hostel.email}</div>
                    <div><strong>Address:</strong> ${hostel.address}</div>
                ` : `<div>No hostel info available.</div>`;
            }
            if (personalDetailsDiv) {
                const self = room.occupants.find(o => o.id.toLowerCase() === user.username.toLowerCase());
                personalDetailsDiv.innerHTML = self ? `
                    <div><strong>Student ID:</strong> ${self.id}</div>
                    <div><strong>Name:</strong> ${self.name}</div>
                    <div><strong>Course:</strong> ${self.course}</div>
                    <div><strong>Year:</strong> ${self.year}</div>
                    <div><strong>Email:</strong> ${self.email}</div>
                    <div><strong>Phone:</strong> ${self.phone}</div>
                ` : `<div>No personal details found.</div>`;
            }
        }

        if (roommatesTbody) {
            roommatesTbody.innerHTML = '';
            if (room) {
                room.occupants.filter(o => o.id.toLowerCase() !== user.username.toLowerCase()).forEach(o => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${o.id}</td>
                        <td>${o.name}</td>
                        <td>${o.course}</td>
                        <td>${o.year}</td>
                        <td>${o.email}</td>
                        <td>${o.phone}</td>
                    `;
                    roommatesTbody.appendChild(tr);
                });
                if (!roommatesTbody.children.length) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td colspan="6" style="text-align:center; color:#666;">No roommates assigned.</td>`;
                    roommatesTbody.appendChild(tr);
                }
            } else {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="6" style="text-align:center; color:#666;">Room not allotted yet.</td>`;
                roommatesTbody.appendChild(tr);
            }
        }
    } else {
        // Warden/Caretaker: show full student table and rooms directory with click-to-view
        if (searchSection) searchSection.style.display = '';
        if (studentTableSection) studentTableSection.style.display = '';
        if (studentRoomSection) studentRoomSection.style.display = 'none';
        if (adminRoomsSection) adminRoomsSection.style.display = '';
        if (adminRoomDetailsSection) adminRoomDetailsSection.style.display = '';

        const dir = document.getElementById('room-directory');
        const destTbody = document.getElementById('admin-room-occupants');
        const label = document.getElementById('selected-room-label');
        if (dir && destTbody && label) {
            dir.innerHTML = '';
            const list = (MockData.rooms && MockData.rooms.length) ? MockData.rooms : DemoRooms;
            list.forEach(room => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.textContent = `${room.block} - ${room.room}`;
                btn.addEventListener('click', function() {
                    label.textContent = `Viewing: ${room.block} · Room ${room.room}`;
                    destTbody.innerHTML = '';
                    room.occupants.forEach(o => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${o.id}</td>
                            <td>${o.name}</td>
                            <td>${o.course}</td>
                            <td>${o.year}</td>
                            <td>${o.email}</td>
                            <td>${o.phone}</td>
                        `;
                        destTbody.appendChild(tr);
                    });
                    if (!destTbody.children.length) {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td colspan="6" style="text-align:center; color:#666;">No occupants.</td>`;
                        destTbody.appendChild(tr);
                    }
                });
                dir.appendChild(btn);
            });
        }
    }
}

// ============================================
// Room Allocation Page (Student message)
// ============================================
function renderRoomAllocationPageByRole() {
    const path = window.location.pathname.split('/').pop();
    if (path !== 'room-allocation.html') return;
    const user = getCurrentUser();
    const role = user?.role || null;

    const statusCard = document.getElementById('student-room-allocation-status');
    const searchSection = document.getElementById('allocation-search-section');
    const tableSection = document.getElementById('allocation-table-section');
    const statsSection = document.getElementById('allocation-stats-section');
    const formSection = document.getElementById('allocation-form-section');

    if (role === 'student') {
        [searchSection, tableSection, statsSection, formSection].forEach(el => { if (el) el.style.display = 'none'; });
        if (!statusCard) return;
        const room = findRoomByStudentId(user.username);
        if (room) {
            statusCard.innerHTML = `
                <div class="info-card" style="background:#e6fff2; border:1px solid #00cc66;">
                  <div class="info-card-title">Room has been allotted</div>
                  <div class="info-card-label">Click below to view your room details</div>
                  <div class="mt-10"><a class="btn btn-primary" href="details.html">Go to Room Details</a></div>
                </div>
            `;
        } else {
            statusCard.innerHTML = `
                <div class="info-card" style="background:#fff9e6; border:1px solid #ffcc66;">
                  <div class="info-card-title" style="color:#a06400;">Room not allotted yet</div>
                  <div class="info-card-label">Choose an option to proceed:</div>
                  <div class="mt-10" style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button id="btn-manual-room-selection" class="btn btn-secondary">Manual Room Selection</button>
                    <button id="btn-smart-room-selector" class="btn btn-primary">Smart Room Selector</button>
                  </div>
                </div>
            `;
            const manualBtn = statusCard.querySelector('#btn-manual-room-selection');
            const smartBtn = statusCard.querySelector('#btn-smart-room-selector');
            if (manualBtn) manualBtn.addEventListener('click', () => {
                showNotification('Manual selection coming soon.', 'info');
            });
            if (smartBtn) smartBtn.addEventListener('click', () => {
                showNotification('Smart selector coming soon.', 'info');
            });
        }
    } else {
        // Staff: show normal content; hide student status card
        if (statusCard) statusCard.style.display = 'none';
    }
}

