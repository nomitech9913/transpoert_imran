// Imran Aktar's Transports - Fleet Management App Logic

// 1. Default datasets to fallback to if localStorage is empty
const defaultTrucks = [
    { id: 1, number: 'IA 01 AB 1234', model: 'Volvo FH 540', mulkiyaExpiry: '2026-07-05', vocExpiry: '2026-07-08', location: 'Salalah/Oman', type: 'Container', status: 'available', image: 'images/truck_green_container.png' },
    { id: 2, number: 'IA 02 CD 5678', model: 'Mercedes Actros 1845', mulkiyaExpiry: '2026-07-25', vocExpiry: '2026-08-15', location: 'Salalah/Oman', type: 'Container', status: 'available', image: 'images/truck_green_container.png' }
];

const defaultBookings = [
    { id: 'TRIP-9021', client: 'Sohar Minerals LLC', route: 'Salalah Port ➔ Muscat Depot', truck: 'IA 01 AB 1234', driver: 'Ahmed Al-Mashani', weight: '18 Ton', containerNumber: 'CN-881729', date: '2026-06-28', status: 'En Route' },
    { id: 'TRIP-9022', client: 'Oman Food Logistics', route: 'Nizwa Cold Store ➔ Salalah Hub', truck: 'IA 05 IJ 7890', driver: 'Salim Bait Said', weight: '20 Ton', containerNumber: 'CN-992102', date: '2026-06-29', status: 'Scheduled' },
    { id: 'TRIP-9023', client: 'Dhofar Trading Co.', route: 'Salalah Port ➔ Thumrait', truck: 'IA 04 GH 3456', driver: 'Imran Aktar', weight: '24 Ton', containerNumber: 'CN-773821', date: '2026-06-27', status: 'Completed' }
];

const defaultDrivers = [
    { id: 1, name: 'Ahmed Al-Mashani', status: 'Active', phone: '+968 9123 4567', license: 'OM-98218-HV', licenseExpiry: '2026-09-15', username: '', password: '', attendance: 'Present' },
    { id: 2, name: 'Salim Bait Said', status: 'Available', phone: '+968 9876 5432', license: 'OM-34821-HV', licenseExpiry: '2026-07-15', username: '', password: '', attendance: 'Present' },
    { id: 3, name: 'Ali Shahri', status: 'Off Duty', phone: '+968 9012 3456', license: 'OM-77481-HV', licenseExpiry: '2026-06-25', username: '', password: '', attendance: 'Absent' },
    { id: 4, name: 'Imran Aktar', status: 'Available', phone: '+968 9283 2755', license: 'OM-10022-HV', licenseExpiry: '2026-10-01', username: '', password: '', attendance: 'Present' }
];

const defaultMaintenance = [
    { id: 1, truck: 'IA 07 MN 1357', type: 'Engine Tuning', issue: 'Loss of power under heavy load', date: '2026-06-26', eta: '2026-06-29', cost: 180, status: 'In Workshop' },
    { id: 2, truck: 'IA 03 EF 9012', type: 'Brake Replacement', issue: 'Squeaking noise reported', date: '2026-06-27', eta: '2026-06-28', cost: 75, status: 'Pending' }
];

const defaultFuelLogs = [
    { id: 1, date: '2026-06-26', truck: 'IA 01 AB 1234', driver: 'Ahmed Al-Mashani', volume: '140 L', cost: '32.2 OMR', location: 'Shell Salalah', odometer: '245,120 km' },
    { id: 2, date: '2026-06-25', truck: 'IA 05 IJ 7890', driver: 'Imran Aktar', volume: '180 L', cost: '41.4 OMR', location: 'Omanoil Thumrait', odometer: '189,450 km' }
];

const defaultDocuments = [
    { id: 1, name: 'National Transport Permit', meta: 'Expiry: Dec 2026', status: 'Active', file: '#' },
    { id: 2, name: 'Border Crossing Clearance (GCC)', meta: 'Expiry: Sep 2026', status: 'Active', file: '#' },
    { id: 3, name: 'Fleet Third-Party Insurance', meta: 'Expiry: Jul 2026', status: 'Renewing', file: '#' }
];

const defaultTrailers = [
    { id: 1, number: 'TL 01 AB 1234', type: 'Container Chassis', mulkiyaExpiry: '2026-07-04', vocExpiry: '2026-07-06', assignedTruck: 'IA 01 AB 1234', status: 'available' },
    { id: 2, number: 'TL 02 CD 5678', type: 'Flatbed', mulkiyaExpiry: '2026-07-28', vocExpiry: '2026-08-30', assignedTruck: 'None', status: 'available' },
    { id: 3, number: 'TL 03 EF 9012', type: 'Lowboy', mulkiyaExpiry: '2026-06-25', vocExpiry: '2026-06-20', assignedTruck: 'None', status: 'maintenance' }
];

let trucksData = JSON.parse(localStorage.getItem('trucksData')) || defaultTrucks;

// Cleanup non-container trucks (since the user requested ONLY container trucks)
const containerOnly = trucksData.filter(t => t.type === 'Container');
if (containerOnly.length !== trucksData.length) {
    trucksData = containerOnly;
    localStorage.setItem('trucksData', JSON.stringify(trucksData));
}

let bookingsData = JSON.parse(localStorage.getItem('bookingsData')) || defaultBookings;
let driversData = JSON.parse(localStorage.getItem('driversData')) || defaultDrivers;
let maintenanceData = JSON.parse(localStorage.getItem('maintenanceData')) || defaultMaintenance;
let fuelLogsData = JSON.parse(localStorage.getItem('fuelLogsData')) || defaultFuelLogs;
let documentsData = JSON.parse(localStorage.getItem('documentsData')) || defaultDocuments;
let trailersData = JSON.parse(localStorage.getItem('trailersData')) || defaultTrailers;

// Ensure all items have unique IDs (for migration/backwards compatibility)
bookingsData.forEach(bk => {
    if (!bk.id) bk.id = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    if (bk.id.startsWith('BK-')) {
        bk.id = bk.id.replace('BK-', 'TRIP-');
    }
    if (!bk.driver) {
        // Fallback default driver names
        if (bk.truck === 'IA 01 AB 1234') bk.driver = 'Ahmed Al-Mashani';
        else if (bk.truck === 'IA 05 IJ 7890') bk.driver = 'Salim Bait Said';
        else bk.driver = 'Imran Aktar';
    }
    if (bk.status === 'Dispatched') {
        bk.status = 'En Route';
    } else if (bk.status === 'Pending Approval') {
        bk.status = 'Scheduled'; // guest requests become scheduled daily trips
    }
    if (bk.containerNumber === undefined) {
        if (bk.id === 'TRIP-9021') bk.containerNumber = 'CN-881729';
        else if (bk.id === 'TRIP-9022') bk.containerNumber = 'CN-992102';
        else if (bk.id === 'TRIP-9023') bk.containerNumber = 'CN-773821';
        else bk.containerNumber = 'N/A';
    }
});
driversData.forEach((d, idx) => {
    if (!d.id) d.id = Date.now() + idx;
    if (d.username === undefined) d.username = '';
    if (d.password === undefined) d.password = '';
    if (d.attendance === undefined) d.attendance = (d.status === 'Active' || d.status === 'Available') ? 'Present' : 'Absent';
    if (d.licenseExpiry === undefined) {
        if (d.name === 'Ahmed Al-Mashani') d.licenseExpiry = '2026-09-15';
        else if (d.name === 'Salim Bait Said') d.licenseExpiry = '2026-07-15';
        else if (d.name === 'Ali Shahri') d.licenseExpiry = '2026-06-25';
        else if (d.name === 'Imran Aktar') d.licenseExpiry = '2026-10-01';
        else d.licenseExpiry = '';
    }
});
maintenanceData.forEach((m, idx) => { if (!m.id) m.id = Date.now() + idx; });
fuelLogsData.forEach((f, idx) => { if (!f.id) f.id = Date.now() + idx; });
documentsData.forEach((doc, idx) => { if (!doc.id) doc.id = Date.now() + idx; });
trailersData.forEach((t, idx) => { if (!t.id) t.id = Date.now() + idx; });

// Migration: Change capacity to mulkiyaExpiry and add vocExpiry in old localStorage records
trucksData.forEach(t => {
    if (t.mulkiyaExpiry === undefined) {
        t.mulkiyaExpiry = t.capacity === '20 Ton' ? '2026-07-05' : '2026-07-25';
        delete t.capacity;
    }
    if (t.vocExpiry === undefined) {
        t.vocExpiry = t.mulkiyaExpiry === '2026-07-05' ? '2026-07-08' : '2026-08-15';
    }
});
trailersData.forEach(t => {
    if (t.mulkiyaExpiry === undefined) {
        if (t.number === 'TL 01 AB 1234' || t.capacity === '25 Ton') {
            t.mulkiyaExpiry = '2026-07-04';
        } else if (t.number === 'TL 03 EF 9012' || t.capacity === '30 Ton') {
            t.mulkiyaExpiry = '2026-06-25';
        } else {
            t.mulkiyaExpiry = '2026-07-28';
        }
        delete t.capacity;
    }
    if (t.vocExpiry === undefined) {
        if (t.number === 'TL 01 AB 1234') {
            t.vocExpiry = '2026-07-06';
        } else if (t.number === 'TL 03 EF 9012') {
            t.vocExpiry = '2026-06-20';
        } else {
            t.vocExpiry = '2026-08-30';
        }
    }
});
saveData();

function saveData() {
    localStorage.setItem('trucksData', JSON.stringify(trucksData));
    localStorage.setItem('bookingsData', JSON.stringify(bookingsData));
    localStorage.setItem('driversData', JSON.stringify(driversData));
    localStorage.setItem('maintenanceData', JSON.stringify(maintenanceData));
    localStorage.setItem('fuelLogsData', JSON.stringify(fuelLogsData));
    localStorage.setItem('documentsData', JSON.stringify(documentsData));
    localStorage.setItem('trailersData', JSON.stringify(trailersData));

    // Cloud sync
    syncToSupabase();

    // Persistent Local File sync
    if (typeof performPersistentSync === 'function') {
        performPersistentSync();
    }
}

// 1b. Admin Authentication State and Credentials
let isAdminLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
let loggedDriverId = sessionStorage.getItem('loggedDriverId') || null;
let supabaseClient = null;

// Supabase Default Credentials (for automatic cross-device synchronization)
const DEFAULT_SUPABASE_URL = 'https://pracmancvmhkjzpdizia.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByYWNtYW5jdm1oa2p6cGRpemlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDcyMjUsImV4cCI6MjA5ODM4MzIyNX0.g1GWHuvRwtwd7MwRkD2V7zdMBgPem-jENc2pNIHYPeI';

window.addEventListener('beforeunload', () => {
    if (loggedDriverId) {
        const d = driversData.find(item => String(item.id) === String(loggedDriverId));
        if (d) {
            d.status = 'Unavailable';
            saveData();
        }
    }
});

// Editing item tracking states
let editingBookingId = null;
let editingDriverId = null;
let editingMaintId = null;
let editingFuelLogId = null;
let editingDocId = null;
let editingTrailerId = null;

// SVG icons for Edit & Delete buttons
const editSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
const deleteSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

// Admin default credentials init & migration
if (!localStorage.getItem('adminUsername') || localStorage.getItem('adminUsername') === 'admin') {
    localStorage.setItem('adminUsername', 'imranakhtar9283');
}
if (!localStorage.getItem('adminPassword') || localStorage.getItem('adminPassword') === 'password123') {
    localStorage.setItem('adminPassword', 'imran9283');
}

// Active Filters State
let searchFilter = '';
let statusFilter = 'all';
let currentLayout = 'grid'; // 'grid' or 'list'

let statusManagerSearchFilter = '';
let bookingsSearchFilter = '';
let driversSearchFilter = '';
let maintenanceSearchFilter = '';
let fuelSearchFilter = '';
let documentsSearchFilter = '';
let trailersSearchFilter = '';
let trailersStatusFilter = 'all';

// Admin Authentication Helper Functions
function checkAdminAuth() {
    if (!isAdminLoggedIn) {
        openAdminLoginModal();
        return false;
    }
    return true;
}

function openAdminLoginModal() {
    const loginModal = document.getElementById('admin-login-modal');
    if (loginModal) {
        const errorEl = document.getElementById('admin-login-error');
        if (errorEl) errorEl.style.display = 'none';
        document.getElementById('admin-login-username').value = '';
        document.getElementById('admin-login-password').value = '';
        loginModal.classList.add('active');
    }
}

function showConfirm(title, message) {
    return new Promise((resolve) => {
        const confirmModal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-modal-title');
        const msgEl = document.getElementById('confirm-modal-message');
        const cancelBtn = document.getElementById('confirm-cancel-btn');
        const okBtn = document.getElementById('confirm-ok-btn');
        
        if (!confirmModal) {
            resolve(false);
            return;
        }
        
        titleEl.innerText = title || 'Confirm Action';
        msgEl.innerText = message || 'Are you sure you want to proceed?';
        
        const cleanup = () => {
            confirmModal.classList.remove('active');
            cancelBtn.removeEventListener('click', onCancel);
            okBtn.removeEventListener('click', onOk);
            confirmModal.removeEventListener('click', onBackdrop);
        };
        
        const onCancel = () => {
            cleanup();
            resolve(false);
        };
        
        const onOk = () => {
            cleanup();
            resolve(true);
        };
        
        const onBackdrop = (e) => {
            if (e.target === confirmModal) {
                cleanup();
                resolve(false);
            }
        };
        
        cancelBtn.addEventListener('click', onCancel);
        okBtn.addEventListener('click', onOk);
        confirmModal.addEventListener('click', onBackdrop);
        
        confirmModal.classList.add('active');
    });
}

function updateAuthUI() {
    const badge = document.getElementById('header-auth-badge');
    const menuText = document.getElementById('admin-login-menu-text');
    
    // Inputs in Settings
    const adminUsernameInput = document.getElementById('admin-username-input');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminSaveBtn = document.getElementById('save-admin-settings-btn');
    const adminMsg = document.getElementById('admin-settings-message');

    // Business Profile Inputs in Settings
    const companyNameInput = document.getElementById('company-name-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const locationInput = document.getElementById('location-input');
    const profileSaveBtn = document.querySelector('#settings-profile-form button[type="submit"]');

    if (isAdminLoggedIn) {
        if (badge) {
            badge.innerText = 'Admin Active';
            badge.className = 'auth-status-badge admin';
        }
        if (menuText) {
            menuText.innerText = 'Admin Logout';
        }
        
        // Business Settings form enabling
        if (companyNameInput) companyNameInput.disabled = false;
        if (phoneInput) phoneInput.disabled = false;
        if (emailInput) emailInput.disabled = false;
        if (locationInput) locationInput.disabled = false;
        if (profileSaveBtn) profileSaveBtn.disabled = false;

        // Settings form enabling
        if (adminUsernameInput) {
            adminUsernameInput.disabled = false;
            adminUsernameInput.value = localStorage.getItem('adminUsername') || 'imranakhtar9283';
        }
        if (adminPasswordInput) {
            adminPasswordInput.disabled = false;
            adminPasswordInput.value = ''; // keep empty for editing
        }
        if (adminSaveBtn) {
            adminSaveBtn.disabled = false;
        }
        if (adminMsg) {
            adminMsg.innerText = 'Admin credentials unlocked. Update username and password to secure data management.';
            adminMsg.style.color = 'var(--text-secondary)';
        }
    } else {
        if (badge) {
            if (loggedDriverId) {
                const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
                if (driver) {
                    badge.innerText = `Driver Active: ${driver.name}`;
                    badge.className = 'auth-status-badge driver';
                } else {
                    badge.innerText = 'Guest (Read Only)';
                    badge.className = 'auth-status-badge guest';
                }
            } else {
                badge.innerText = 'Guest (Read Only)';
                badge.className = 'auth-status-badge guest';
            }
        }
        if (menuText) {
            menuText.innerText = 'Admin Login';
        }
        
        // Business Settings form disabling
        if (companyNameInput) companyNameInput.disabled = true;
        if (phoneInput) phoneInput.disabled = true;
        if (emailInput) emailInput.disabled = true;
        if (locationInput) locationInput.disabled = true;
        if (profileSaveBtn) profileSaveBtn.disabled = true;

        // Settings form disabling
        if (adminUsernameInput) {
            adminUsernameInput.disabled = true;
            adminUsernameInput.value = localStorage.getItem('adminUsername') || 'imranakhtar9283';
        }
        if (adminPasswordInput) {
            adminPasswordInput.disabled = true;
            adminPasswordInput.value = '';
        }
        if (adminSaveBtn) {
            adminSaveBtn.disabled = true;
        }
        if (adminMsg) {
            adminMsg.innerText = 'Please log in as admin to update credentials.';
            adminMsg.style.color = 'var(--accent-red)';
        }
    }
    
    // Toggle action columns in tables
    document.querySelectorAll('.admin-only-header').forEach(el => {
        el.style.display = isAdminLoggedIn ? 'table-cell' : 'none';
    });

    // Toggle admin-only buttons (like print buttons)
    document.querySelectorAll('.admin-only-btn').forEach(el => {
        el.style.display = isAdminLoggedIn ? 'inline-flex' : 'none';
    });

    // Toggle Bookings buttons
    const openBookingBtn = document.getElementById('open-booking-btn');
    if (openBookingBtn) openBookingBtn.style.display = isAdminLoggedIn ? 'inline-flex' : 'none';

    // Toggle Trailers buttons
    const openTrailerBtn = document.getElementById('open-add-trailer-btn');
    if (openTrailerBtn) openTrailerBtn.style.display = isAdminLoggedIn ? 'inline-flex' : 'none';
    
    // Re-render datasets to show/hide Edit/Delete actions dynamically
    if (typeof renderBookings === 'function') renderBookings();
    if (typeof renderDrivers === 'function') renderDrivers();
    if (typeof renderMaintenance === 'function') renderMaintenance();
    if (typeof renderFuelLogs === 'function') renderFuelLogs();
    if (typeof renderDocuments === 'function') renderDocuments();
    if (typeof renderTrailers === 'function') renderTrailers();
    if (typeof renderDriverPortal === 'function') renderDriverPortal();
    
    // Update persistent backup status UI
    if (typeof updatePersistentBackupUI === 'function') updatePersistentBackupUI();
}

function syncSettingsDOM() {
    const phone = localStorage.getItem('profilePhone') || "92832755";
    const location = localStorage.getItem('profileLocation') || "Salalah/Oman";
    const email = localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com";
    
    // Sync contact detail references across DOM
    const contactLines = document.querySelectorAll('.sidebar-contact .contact-line span');
    if (contactLines.length >= 3) {
        contactLines[0].innerText = phone;
        contactLines[1].innerText = location;
        contactLines[2].innerText = email;
    }
    
    const headerInfoSpan = document.querySelectorAll('.header-info-item span');
    if (headerInfoSpan.length >= 2) {
        headerInfoSpan[0].innerText = phone;
        headerInfoSpan[1].innerText = location;
    }
}

// 2. DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    
    // Sidebar items
    const menuItems = document.querySelectorAll('.menu-item');
    const viewPanels = document.querySelectorAll('.view-panel');
    const sidebar = document.querySelector('.sidebar');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    // Layout switches
    const btnGrid = document.getElementById('btn-grid-layout');
    const btnList = document.getElementById('btn-list-layout');
    const container = document.getElementById('trucks-list-container');
    
    // Inputs and filters
    const searchInput = document.getElementById('truck-search-input');
    const searchBtn = document.getElementById('search-submit-btn');
    const statusSelect = document.getElementById('status-filter-select');
    
    // Stats cards
    const statsCards = document.querySelectorAll('.stat-card');
    
    // Table searches and filters
    const truckTableSearch = document.getElementById('trucks-table-search');
    const truckTableFilter = document.getElementById('trucks-table-filter');
    
    // 3. Tab switching & Mobile Toggle
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            // Toggle active menu
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Toggle view panel
            viewPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${target}-view`) {
                    panel.classList.add('active');
                }
            });
            
            // Scroll to top of content
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Close mobile menu
            sidebar.classList.remove('open');
        });
    });
    
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });

    // 4. Layout Switching
    btnGrid.addEventListener('click', () => {
        currentLayout = 'grid';
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
        container.classList.remove('list-layout');
        container.classList.add('grid-layout');
        renderTrucks();
    });
    
    btnList.addEventListener('click', () => {
        currentLayout = 'list';
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
        container.classList.remove('grid-layout');
        container.classList.add('list-layout');
        renderTrucks();
    });

    // 5. Search & Filters
    searchInput.addEventListener('keyup', (e) => {
        searchFilter = e.target.value;
        renderTrucks();
    });
    
    searchBtn.addEventListener('click', () => {
        searchFilter = searchInput.value;
        renderTrucks();
    });
    
    statusSelect.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTrucks();
    });
    
    // Stats cards filters
    statsCards.forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-filter');
            statusFilter = filter;
            statusSelect.value = filter;
            renderTrucks();
        });
    });

    // Trucks panel table filter
    truckTableSearch.addEventListener('keyup', (e) => {
        const query = e.target.value.toLowerCase();
        renderTrucksTable(query, truckTableFilter.value);
    });
    
    truckTableFilter.addEventListener('change', (e) => {
        renderTrucksTable(truckTableSearch.value.toLowerCase(), e.target.value);
    });

    // Page-specific search and filter event listeners
    const statusManagerSearch = document.getElementById('status-manager-search');
    if (statusManagerSearch) {
        statusManagerSearch.addEventListener('keyup', (e) => {
            statusManagerSearchFilter = e.target.value;
            renderStatusManager();
        });
    }

    const bookingsSearch = document.getElementById('bookings-search');
    if (bookingsSearch) {
        bookingsSearch.addEventListener('keyup', (e) => {
            bookingsSearchFilter = e.target.value;
            renderBookings();
        });
    }

    const driversSearch = document.getElementById('drivers-search');
    if (driversSearch) {
        driversSearch.addEventListener('keyup', (e) => {
            driversSearchFilter = e.target.value;
            renderDrivers();
        });
    }

    const maintenanceSearch = document.getElementById('maintenance-search');
    if (maintenanceSearch) {
        maintenanceSearch.addEventListener('keyup', (e) => {
            maintenanceSearchFilter = e.target.value;
            renderMaintenance();
        });
    }

    const fuelSearch = document.getElementById('fuel-search');
    if (fuelSearch) {
        fuelSearch.addEventListener('keyup', (e) => {
            fuelSearchFilter = e.target.value;
            renderFuelLogs();
        });
    }

    const documentsSearch = document.getElementById('documents-search');
    if (documentsSearch) {
        documentsSearch.addEventListener('keyup', (e) => {
            documentsSearchFilter = e.target.value;
            renderDocuments();
        });
    }

    const trailersSearch = document.getElementById('trailers-table-search');
    if (trailersSearch) {
        trailersSearch.addEventListener('keyup', (e) => {
            trailersSearchFilter = e.target.value;
            renderTrailers();
        });
    }

    const trailersFilterSelect = document.getElementById('trailers-table-filter');
    if (trailersFilterSelect) {
        trailersFilterSelect.addEventListener('change', (e) => {
            trailersStatusFilter = e.target.value;
            renderTrailers();
        });
    }

    // Load persisted settings
    const companyInput = document.getElementById('company-name-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const locationInput = document.getElementById('location-input');
    const web3formsKeyInput = document.getElementById('web3forms-key-input');
    
    if (companyInput) companyInput.value = localStorage.getItem('profileCompanyName') || "Imran Aktar's Transports";
    if (phoneInput) phoneInput.value = localStorage.getItem('profilePhone') || "92832755";
    if (emailInput) emailInput.value = localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com";
    if (locationInput) locationInput.value = localStorage.getItem('profileLocation') || "Salalah/Oman";
    if (web3formsKeyInput) web3formsKeyInput.value = localStorage.getItem('web3formsKey') || "";
    
    syncSettingsDOM();

    // 6. Modals & Forms
    setupModals();
    setupDriverPortal();
    setupSettingsPortal();
    
    // Initialize Dashboard rendering
    updateDashboardStats();
    renderTrucks();
    renderTrucksTable();
    renderStatusManager();
    renderBookings();
    renderDrivers();
    renderMaintenance();
    renderFuelLogs();
    renderDocuments();
    renderTrailers();

    // Trailer Form submit
    const addTrailerForm = document.getElementById('add-trailer-form');
    if (addTrailerForm) {
        addTrailerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!checkAdminAuth()) return;
            
            const plate = document.getElementById('trailer-plate').value.toUpperCase().trim();
            const type = document.getElementById('trailer-type').value;
            const mulkiyaExpiry = document.getElementById('trailer-mulkiya-expiry').value;
            const vocExpiry = document.getElementById('trailer-voc-expiry').value;
            const assignedTruck = document.getElementById('trailer-truck-select').value;
            const status = document.getElementById('trailer-status').value;
            
            if (editingTrailerId) {
                const t = trailersData.find(item => item.id === editingTrailerId);
                if (t) {
                    t.number = plate;
                    t.type = type;
                    t.mulkiyaExpiry = mulkiyaExpiry;
                    t.vocExpiry = vocExpiry;
                    t.assignedTruck = assignedTruck;
                    t.status = status;
                }
                showSuccessToast('Trailer Updated', `Trailer ${plate} updated successfully.`);
                editingTrailerId = null;
            } else {
                const newId = trailersData.length > 0 ? Math.max(...trailersData.map(t => t.id)) + 1 : 1;
                trailersData.push({
                    id: newId,
                    number: plate,
                    type: type,
                    mulkiyaExpiry: mulkiyaExpiry,
                    vocExpiry: vocExpiry,
                    assignedTruck: assignedTruck,
                    status: status
                });
                showSuccessToast('Trailer Registered', `Trailer ${plate} has been added successfully.`);
            }
            
            saveData();
            renderTrailers();
            closeModal(document.getElementById('add-trailer-modal'));
            addTrailerForm.reset();
        });
    }
    
    // Initialize Auth UI state
    updateAuthUI();

    // Backup & Restore Event Listeners
    const btnExportData = document.getElementById('btn-export-data');
    if (btnExportData) {
        btnExportData.addEventListener('click', () => {
            exportFleetData();
        });
    }

    const btnImportData = document.getElementById('btn-import-data');
    if (btnImportData) {
        btnImportData.addEventListener('click', () => {
            importFleetData();
        });
    }

    const fileInput = document.getElementById('import-backup-file');
    const importFilename = document.getElementById('import-filename');
    if (fileInput && importFilename) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                importFilename.textContent = e.target.files[0].name;
                importFilename.style.color = 'var(--primary-green-bright)';
            } else {
                importFilename.textContent = 'No file selected';
                importFilename.style.color = 'var(--text-muted)';
            }
        });
    }

    // Supabase Credentials UI Hydration
    const supabaseUrlInput = document.getElementById('supabase-url-input');
    const supabaseKeyInput = document.getElementById('supabase-key-input');
    const syncDisabled = localStorage.getItem('supabaseSyncDisabled') === 'true';
    if (supabaseUrlInput) supabaseUrlInput.value = localStorage.getItem('supabaseUrl') || (syncDisabled ? '' : DEFAULT_SUPABASE_URL);
    if (supabaseKeyInput) supabaseKeyInput.value = localStorage.getItem('supabaseKey') || (syncDisabled ? '' : DEFAULT_SUPABASE_KEY);

    // Supabase Connect Form submission
    const supabaseForm = document.getElementById('settings-supabase-form');
    if (supabaseForm) {
        supabaseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let url = document.getElementById('supabase-url-input').value.trim();
            const key = document.getElementById('supabase-key-input').value.trim();
            
            if (url && key) {
                // Auto-sanitize URL: strip trailing slashes and /rest/v1 endpoint suffixes
                url = url.replace(/\/$/, '');
                if (url.endsWith('/rest/v1')) {
                    url = url.substring(0, url.length - 8);
                }
                
                localStorage.removeItem('supabaseSyncDisabled');
                localStorage.setItem('supabaseUrl', url);
                localStorage.setItem('supabaseKey', key);
                showSuccessToast('Supabase Credentials Saved', 'Attempting cloud synchronization connection...');
                initSupabase();
            } else {
                localStorage.setItem('supabaseSyncDisabled', 'true');
                localStorage.removeItem('supabaseUrl');
                localStorage.removeItem('supabaseKey');
                supabaseClient = null;
                initSupabase();
                showSuccessToast('Supabase Disconnected', 'Cloud synchronization credentials cleared.');
            }
        });
    }

    // Connect to Supabase on load
    initSupabase();

    // Initialize Persistent Local File Auto-Backup on load
    if (typeof initPersistentBackup === 'function') {
        initPersistentBackup();
    }
});

function formatDate(dateVal) {
    if (!dateVal) return 'N/A';
    
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    if (dateVal instanceof Date) {
        return `${months[dateVal.getMonth()]} ${dateVal.getDate()}, ${dateVal.getFullYear()}, ${dateVal.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }

    // Match YYYY-MM-DD
    const match = String(dateVal).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const year = match[1];
        const monthIndex = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        if (monthIndex >= 0 && monthIndex < 12) {
            return `${months[monthIndex]} ${day}, ${year}`;
        }
    }

    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return dateVal;
}

function checkMulkiyaExpiry(expiryDateStr) {
    if (!expiryDateStr) return { isNearExpiry: false, isExpired: false, textClass: '' };
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0,0,0,0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0 || diffDays <= 10) {
        return { isNearExpiry: true, isExpired: diffDays < 0, textClass: 'near-expiry' };
    }
    return { isNearExpiry: false, isExpired: false, textClass: '' };
}

window.toggleSelectAll = function(checkboxClass, checked) {
    document.querySelectorAll(`.${checkboxClass}`).forEach(cb => {
        cb.checked = checked;
    });
};

// 7. Core Render Functions

// A. Render Dashboard Trucks
function renderTrucks() {
    const container = document.getElementById('trucks-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredTrucks = trucksData.filter(truck => {
        const matchesSearch = truck.number.toLowerCase().includes(searchFilter.toLowerCase()) || 
                             truck.model.toLowerCase().includes(searchFilter.toLowerCase()) ||
                             truck.type.toLowerCase().includes(searchFilter.toLowerCase());
        const matchesStatus = statusFilter === 'all' || truck.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    if (filteredTrucks.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary); background: var(--bg-card); border-radius: var(--border-radius); border: 1px dashed var(--border-color);">
                <p>No trucks match the search or filter criteria.</p>
            </div>
        `;
        return;
    }
    
    filteredTrucks.forEach(truck => {
        const card = document.createElement('div');
        card.className = 'truck-card';
        
        let statusClass = 'status-available';
        let statusText = 'AVAILABLE';
        
        if (truck.status === 'unavailable') {
            statusClass = 'status-unavailable';
            statusText = 'NOT AVAILABLE';
        } else if (truck.status === 'maintenance') {
            statusClass = 'status-maintenance';
            statusText = 'IN MAINTENANCE';
        }
        
        // Pick truck image based on model/spec
        let imageSrc = truck.image;
        
        card.innerHTML = `
            <div class="truck-card-image">
                <img src="${imageSrc}" alt="${truck.model}">
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="truck-card-content">
                <h4 class="truck-number">${truck.number}</h4>
                <div class="truck-specs">
                    <div class="spec-item">
                        <span class="spec-label">Model</span>
                        <span class="spec-val">${truck.model}</span>
                    </div>
                    <div class="spec-item text-right">
                        <span class="spec-label">Mulkiya Expiry</span>
                        <span class="spec-val ${checkMulkiyaExpiry(truck.mulkiyaExpiry).textClass}">${formatDate(truck.mulkiyaExpiry)}</span>
                    </div>
                </div>
                <div class="truck-specs" style="margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 4px;">
                    <div class="spec-item">
                        <span class="spec-label">VOC Expiry</span>
                        <span class="spec-val ${checkMulkiyaExpiry(truck.vocExpiry).textClass}">${formatDate(truck.vocExpiry)}</span>
                    </div>
                </div>
                <div class="truck-card-divider"></div>
                <div class="truck-meta">
                    <div class="meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${truck.location}</span>
                    </div>
                    <div class="meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <span>${truck.type}</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// B. Update Dashboard Stats Counter
function updateDashboardStats() {
    const totalCount = trucksData.length;
    const availableCount = trucksData.filter(t => t.status === 'available').length;
    const unavailableCount = trucksData.filter(t => t.status === 'unavailable').length;
    const maintCount = trucksData.filter(t => t.status === 'maintenance').length;
    
    document.getElementById('stat-total').innerText = totalCount;
    document.getElementById('stat-available').innerText = availableCount;
    document.getElementById('stat-unavailable').innerText = unavailableCount;
    document.getElementById('stat-maintenance').innerText = maintCount;
}

// C. Render Trucks Management Table
function renderTrucksTable(query = '', status = 'all') {
    const tbody = document.getElementById('trucks-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const filtered = trucksData.filter(t => {
        const matchesQuery = t.number.toLowerCase().includes(query) || t.model.toLowerCase().includes(query) || t.location.toLowerCase().includes(query);
        const matchesStatus = status === 'all' || t.status === status;
        return matchesQuery && matchesStatus;
    });
    
    filtered.forEach(truck => {
        const row = document.createElement('tr');
        
        let statusBadge = `<span class="status-badge status-available" style="position:relative; top:0; right:0;">Available</span>`;
        if (truck.status === 'unavailable') {
            statusBadge = `<span class="status-badge status-unavailable" style="position:relative; top:0; right:0;">Not Available</span>`;
        } else if (truck.status === 'maintenance') {
            statusBadge = `<span class="status-badge status-maintenance" style="position:relative; top:0; right:0;">Maintenance</span>`;
        }
        
        row.innerHTML = `
            <td style="font-weight:700; color:var(--primary-green-bright);">${truck.number}</td>
            <td>${truck.model}</td>
            <td><span class="${checkMulkiyaExpiry(truck.mulkiyaExpiry).textClass}">${formatDate(truck.mulkiyaExpiry)}</span></td>
            <td><span class="${checkMulkiyaExpiry(truck.vocExpiry).textClass}">${formatDate(truck.vocExpiry)}</span></td>
            <td>${truck.type}</td>
            <td>${truck.location}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-table-action" onclick="toggleTruckStatus(${truck.id})" title="Toggle Availability">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                        </svg>
                    </button>
                    <button class="btn-table-action action-delete" onclick="deleteTruck(${truck.id})" title="Delete Vehicle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// D. Render Bookings
function renderBookings() {
    const tbody = document.getElementById('bookings-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const filtered = bookingsData.filter(bk => {
        const query = bookingsSearchFilter.toLowerCase();
        return bk.id.toLowerCase().includes(query) || 
               bk.client.toLowerCase().includes(query) || 
               bk.route.toLowerCase().includes(query) || 
               bk.truck.toLowerCase().includes(query) || 
               (bk.driver && bk.driver.toLowerCase().includes(query)) ||
               bk.weight.toLowerCase().includes(query) || 
               (bk.containerNumber && bk.containerNumber.toLowerCase().includes(query)) ||
               bk.status.toLowerCase().includes(query);
    });
    
    filtered.forEach(bk => {
        const row = document.createElement('tr');
        
        let statusStyle = 'color: #d97706; font-weight:600;'; // default yellow for Scheduled
        if (bk.status === 'En Route') {
            statusStyle = 'color: #3b82f6; font-weight:600;'; // blue
        } else if (bk.status === 'Completed') {
            statusStyle = 'color: #059669; font-weight:600;'; // green
        } else if (bk.status === 'Delayed') {
            statusStyle = 'color: #ef4444; font-weight:600;'; // red
        }
        
        let actionsHtml = '';
        if (isAdminLoggedIn) {
            actionsHtml = `
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action action-edit" onclick="editBooking('${bk.id}')" title="Edit Trip">
                            ${editSvg}
                        </button>
                        <button class="btn-table-action action-delete" onclick="deleteBooking('${bk.id}')" title="Delete Trip">
                            ${deleteSvg}
                        </button>
                    </div>
                </td>
            `;
        }
        
        row.innerHTML = `
            <td style="font-weight:700;">${bk.id}</td>
            <td>${bk.client}</td>
            <td>${bk.route}</td>
            <td style="color: var(--primary-green-bright); font-weight:600;">${bk.truck}</td>
            <td style="font-weight:600; color:var(--text-primary);">${bk.driver || 'N/A'}</td>
            <td>${bk.weight}</td>
            <td>${bk.containerNumber || 'N/A'}</td>
            <td>${formatDate(bk.date)}</td>
            <td style="${statusStyle}">${bk.status}</td>
            ${actionsHtml}
        `;
        tbody.appendChild(row);
    });
}

// E. Render Drivers
function renderDrivers() {
    const container = document.getElementById('drivers-grid-container');
    if (!container) return;
    container.innerHTML = '';
    
    const filtered = driversData.filter(d => {
        const query = driversSearchFilter.toLowerCase();
        return d.name.toLowerCase().includes(query) || 
               d.phone.toLowerCase().includes(query) || 
               d.license.toLowerCase().includes(query) || 
               (d.licenseExpiry && d.licenseExpiry.toLowerCase().includes(query)) ||
               d.status.toLowerCase().includes(query);
    });
    
    filtered.forEach(d => {
        const card = document.createElement('div');
        card.className = 'driver-card';
        
        let statusBg = 'background-color: #ecfdf5; color: #059669; border: 1px solid rgba(5,150,105,0.15);';
        if (d.status === 'Active') {
            statusBg = 'background-color: #eff6ff; color: #1d4ed8; border: 1px solid rgba(29,78,216,0.15);';
        } else if (d.status === 'Off Duty') {
            statusBg = 'background-color: #fef2f2; color: #dc2626; border: 1px solid rgba(220,38,38,0.15);';
        } else if (d.status === 'Unavailable') {
            statusBg = 'background-color: #f1f5f9; color: #64748b; border: 1px solid rgba(100,116,139,0.15);';
        }
        
        const initials = d.name.split(' ').map(n => n[0]).join('');
        
        let actionsHtml = '';
        if (isAdminLoggedIn) {
            actionsHtml = `
                <div class="card-actions">
                    <button class="btn-table-action action-edit" onclick="editDriver('${d.id}')" title="Edit Driver">
                        ${editSvg}
                    </button>
                    <button class="btn-table-action action-delete" onclick="deleteDriver('${d.id}')" title="Delete Driver">
                        ${deleteSvg}
                    </button>
                </div>
            `;
        }
        
        let attendanceColor = d.attendance === 'Present' ? '#059669' : '#dc2626';
        card.innerHTML = `
            <div class="driver-avatar">${initials}</div>
            <h4 class="driver-name">${d.name}</h4>
            <span class="driver-status" style="${statusBg}">${d.status}</span>
            <div class="driver-info-block">
                <div class="driver-info-row">
                    <span>Phone</span>
                    <span>${d.phone}</span>
                </div>
                <div class="driver-info-row">
                    <span>License</span>
                    <span>${d.license}</span>
                </div>
                <div class="driver-info-row">
                    <span>Licence Expiry</span>
                    <span class="${checkMulkiyaExpiry(d.licenseExpiry).textClass}">${formatDate(d.licenseExpiry)}</span>
                </div>
                <div class="driver-info-row">
                    <span>Attendance</span>
                    <span style="font-weight: 700; color: ${attendanceColor};">${d.attendance || 'Absent'}</span>
                </div>
            </div>
            ${actionsHtml}
        `;
        container.appendChild(card);
    });
}

// F. Render Maintenance
function renderMaintenance() {
    const tbody = document.getElementById('maintenance-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectAllCheck = document.getElementById('maint-select-all');
    if (selectAllCheck) selectAllCheck.checked = false;
    
    const filtered = maintenanceData.filter(m => {
        const query = maintenanceSearchFilter.toLowerCase();
        return m.truck.toLowerCase().includes(query) || 
               m.type.toLowerCase().includes(query) || 
               m.issue.toLowerCase().includes(query) || 
               m.status.toLowerCase().includes(query);
    });
    
    filtered.forEach((m) => {
        const row = document.createElement('tr');
        
        let statusStyle = 'color: #e3b12f; font-weight:600;';
        if (m.status === 'Pending') {
            statusStyle = 'color: #f45b5b; font-weight:600;';
        } else if (m.status === 'Completed') {
            statusStyle = 'color: #49c95d; font-weight:600;';
        }
        
        let actionsHtml = '';
        if (isAdminLoggedIn) {
            let readyButton = m.status !== 'Completed' ? `
                <button class="btn btn-outline" style="padding: 4px 10px; font-size:11px;" onclick="completeMaintenance('${m.id}')">
                    Mark Ready
                </button>
            ` : '<span>Serviced</span>';
            actionsHtml = `
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        ${readyButton}
                        <button class="btn-table-action action-edit" onclick="editMaintenance('${m.id}')" title="Edit Maintenance">
                            ${editSvg}
                        </button>
                        <button class="btn-table-action action-delete" onclick="deleteMaintenance('${m.id}')" title="Delete Entry">
                            ${deleteSvg}
                        </button>
                    </div>
                </td>
            `;
        }
        
        row.innerHTML = `
            <td><input type="checkbox" class="maint-print-select" data-id="${m.id}"></td>
            <td style="font-weight:700; color:var(--primary-green-bright);">${m.truck}</td>
            <td>${m.type}</td>
            <td>${m.issue}</td>
            <td>${formatDate(m.date)}</td>
            <td>${formatDate(m.eta)}</td>
            <td>${m.cost} OMR</td>
            <td style="${statusStyle}">${m.status}</td>
            ${actionsHtml}
        `;
        tbody.appendChild(row);
    });
    
    const workshopCount = maintenanceData.filter(m => m.status === 'In Workshop').length;
    const workshopCountEl = document.getElementById('maintenance-workshop-count');
    if (workshopCountEl) {
        workshopCountEl.innerText = workshopCount;
    }
}

// G. Render Fuel Logs
function renderFuelLogs() {
    const tbody = document.getElementById('fuel-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectAllCheck = document.getElementById('fuel-select-all');
    if (selectAllCheck) selectAllCheck.checked = false;
    
    const filtered = fuelLogsData.filter(log => {
        const query = fuelSearchFilter.toLowerCase();
        return log.date.toLowerCase().includes(query) || 
               log.truck.toLowerCase().includes(query) || 
               log.driver.toLowerCase().includes(query) || 
               log.location.toLowerCase().includes(query) || 
               log.odometer.toLowerCase().includes(query);
    });
    
    filtered.forEach(log => {
        const row = document.createElement('tr');
        
        let actionsHtml = '';
        if (isAdminLoggedIn) {
            actionsHtml = `
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action action-edit" onclick="editFuelLog('${log.id}')" title="Edit Log">
                            ${editSvg}
                        </button>
                        <button class="btn-table-action action-delete" onclick="deleteFuelLog('${log.id}')" title="Delete Log">
                            ${deleteSvg}
                        </button>
                    </div>
                </td>
            `;
        }
        
        row.innerHTML = `
            <td><input type="checkbox" class="fuel-print-select" data-id="${log.id}"></td>
            <td>${formatDate(log.date)}</td>
            <td style="font-weight:700; color:var(--primary-green-bright);">${log.truck}</td>
            <td>${log.driver}</td>
            <td>${log.volume}</td>
            <td>${log.cost}</td>
            <td>${log.location}</td>
            <td>${log.odometer}</td>
            ${actionsHtml}
        `;
        tbody.appendChild(row);
    });
}

// H. Render Documents
function renderDocuments() {
    const container = document.getElementById('documents-grid-container');
    if (!container) return;
    container.innerHTML = '';
    
    const filtered = documentsData.filter(doc => {
        const query = documentsSearchFilter.toLowerCase();
        return doc.name.toLowerCase().includes(query) || 
               doc.meta.toLowerCase().includes(query) || 
               doc.status.toLowerCase().includes(query);
    });
    
    filtered.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doc-card bg-dark-panel';
        
        let statusColor = 'text-green';
        if (doc.status === 'Renewing') statusColor = 'text-yellow';
        else if (doc.status === 'Expired') statusColor = 'text-red';
        
        let actionsHtml = '';
        if (isAdminLoggedIn) {
            actionsHtml = `
                <div class="card-actions">
                    <button class="btn-table-action action-edit" onclick="editDocument('${doc.id}')" title="Edit Document">
                        ${editSvg}
                    </button>
                    <button class="btn-table-action action-delete" onclick="deleteDocument('${doc.id}')" title="Delete Document">
                        ${deleteSvg}
                    </button>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="doc-icon ${statusColor}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
            </div>
            <div class="doc-details" style="flex-grow: 1;">
                <h4>${doc.name}</h4>
                <p class="doc-meta">${doc.meta} | ${doc.status}</p>
                <a href="javascript:void(0)" onclick="viewDocumentFile('${doc.id}')" class="btn-text ${statusColor}">${doc.status === 'Renewing' ? 'Renew Document' : 'View PDF'}</a>
                ${actionsHtml}
            </div>
        `;
        container.appendChild(card);
    });
}



// 8. Interactive Functions (Triggered by Buttons)

// Toggle Truck Status directly
window.toggleTruckStatus = function(truckId) {
    if (!checkAdminAuth()) return;
    const truck = trucksData.find(t => t.id === truckId);
    if (truck) {
        if (truck.status === 'available') {
            truck.status = 'unavailable';
        } else if (truck.status === 'unavailable') {
            truck.status = 'maintenance';
        } else {
            truck.status = 'available';
        }
        
        // Sync lists
        saveData();
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderStatusManager();
        populateModalDropdowns();
    }
};

// Delete Truck from fleet
window.deleteTruck = async function(truckId) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Remove Vehicle', 'Are you sure you want to remove this truck from the fleet register?');
    if (confirmed) {
        trucksData = trucksData.filter(t => t.id !== truckId);
        
        saveData();
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderStatusManager();
        populateModalDropdowns();
        showSuccessToast('Vehicle Deleted', 'The vehicle was successfully removed from the register.');
    }
};

// Complete maintenance
window.completeMaintenance = function(id) {
    if (!checkAdminAuth()) return;
    const log = maintenanceData.find(item => String(item.id) === String(id));
    if (log) {
        log.status = 'Completed';
        
        // Find truck and set status to available
        const truck = trucksData.find(t => t.number === log.truck);
        if (truck) {
            truck.status = 'available';
        }
        
        saveData();
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderStatusManager();
        renderMaintenance();
        populateModalDropdowns();
        showSuccessToast('Servicing Completed', `Vehicle ${log.truck} has been returned to service.`);
    }
};

// Edit/Delete handlers for bookings, drivers, maintenance, fuel logs, documents, and reports
window.editBooking = function(id) {
    if (!checkAdminAuth()) return;
    const bk = bookingsData.find(b => b.id === id);
    if (bk) {
        editingBookingId = id;
        const titleEl = document.getElementById('trip-modal-title');
        if (titleEl) titleEl.innerText = 'Edit Daily Trip Details';
        const submitEl = document.getElementById('trip-submit-btn');
        if (submitEl) submitEl.innerText = 'Save Changes';
        
        document.getElementById('booking-client').value = bk.client;
        
        const routeParts = bk.route.split(' ➔ ');
        document.getElementById('booking-origin').value = routeParts[0] || 'Salalah Depot';
        document.getElementById('booking-dest').value = routeParts[1] || '';
        
        // Show truck select and make it required
        const truckSelectRow = document.getElementById('booking-truck-select').closest('.form-group');
        if (truckSelectRow) {
            truckSelectRow.style.display = 'block';
        }
        document.getElementById('booking-truck-select').setAttribute('required', 'required');
        
        populateModalDropdowns();
        
        const bookingTruckSelect = document.getElementById('booking-truck-select');
        if (bk.truck && bk.truck !== 'Pending Assignment') {
            if (bookingTruckSelect && !Array.from(bookingTruckSelect.options).some(opt => opt.value === bk.truck)) {
                const opt = document.createElement('option');
                opt.value = bk.truck;
                opt.text = bk.truck;
                bookingTruckSelect.appendChild(opt);
            }
            if (bookingTruckSelect) bookingTruckSelect.value = bk.truck;
        } else {
            if (bookingTruckSelect) bookingTruckSelect.value = '';
        }

        const bookingDriverSelect = document.getElementById('booking-driver-select');
        if (bk.driver) {
            if (bookingDriverSelect && !Array.from(bookingDriverSelect.options).some(opt => opt.value === bk.driver)) {
                const opt = document.createElement('option');
                opt.value = bk.driver;
                opt.text = bk.driver;
                bookingDriverSelect.appendChild(opt);
            }
            if (bookingDriverSelect) bookingDriverSelect.value = bk.driver;
        } else {
            if (bookingDriverSelect) bookingDriverSelect.value = '';
        }
        
        document.getElementById('booking-weight').value = bk.weight;
        document.getElementById('booking-container-number').value = bk.containerNumber || '';
        document.getElementById('booking-date').value = bk.date;
        
        // Show status group and prefill status option
        const statusGroup = document.getElementById('trip-status-group');
        if (statusGroup) statusGroup.style.display = 'block';
        document.getElementById('booking-status').value = bk.status || 'Scheduled';
        
        const bookingModal = document.getElementById('booking-modal');
        if (bookingModal) bookingModal.classList.add('active');
    }
};

window.deleteBooking = async function(id) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Delete Trip Record', 'Are you sure you want to delete this trip record?');
    if (confirmed) {
        bookingsData = bookingsData.filter(b => b.id !== id);
        saveData();
        renderBookings();
        showSuccessToast('Trip Deleted', 'Trip record successfully removed.');
    }
};

window.editDriver = function(id) {
    if (!checkAdminAuth()) return;
    const d = driversData.find(item => String(item.id) === String(id));
    if (d) {
        editingDriverId = id;
        document.getElementById('register-driver-title').innerText = 'Edit Driver Profile';
        document.getElementById('driver-submit-btn').innerText = 'Save Changes';
        
        document.getElementById('driver-name-input').value = d.name;
        document.getElementById('driver-phone-input').value = d.phone;
        document.getElementById('driver-license-input').value = d.license;
        document.getElementById('driver-license-expiry-input').value = d.licenseExpiry || '';
        document.getElementById('driver-status-input').value = d.status || 'Available';
        document.getElementById('driver-attendance-input').value = d.attendance || 'Present';
        
        const registerDriverModal = document.getElementById('register-driver-modal');
        if (registerDriverModal) registerDriverModal.classList.add('active');
    }
};

window.deleteDriver = async function(id) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Delete Driver', 'Are you sure you want to delete this driver?');
    if (confirmed) {
        driversData = driversData.filter(item => String(item.id) !== String(id));
        saveData();
        renderDrivers();
        showSuccessToast('Driver Deleted', 'Driver successfully removed from system.');
    }
};

window.editMaintenance = function(id) {
    if (!checkAdminAuth()) return;
    const m = maintenanceData.find(item => String(item.id) === String(id));
    if (m) {
        editingMaintId = id;
        const titleEl = document.querySelector('#maintenance-modal h3');
        if (titleEl) titleEl.innerText = 'Edit Maintenance Entry';
        const submitEl = document.querySelector('#schedule-maintenance-form button[type="submit"]');
        if (submitEl) submitEl.innerText = 'Save Changes';
        
        populateModalDropdowns();
        const maintTruckSelect = document.getElementById('maint-truck-select');
        if (maintTruckSelect && !Array.from(maintTruckSelect.options).some(opt => opt.value === m.truck)) {
            const opt = document.createElement('option');
            opt.value = m.truck;
            opt.text = m.truck;
            maintTruckSelect.appendChild(opt);
        }
        if (maintTruckSelect) maintTruckSelect.value = m.truck;
        
        document.getElementById('maint-type').value = m.type;
        document.getElementById('maint-issue').value = m.issue;
        
        const maintModal = document.getElementById('maintenance-modal');
        if (maintModal) maintModal.classList.add('active');
    }
};

window.deleteMaintenance = async function(id) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Delete Maintenance', 'Are you sure you want to delete this maintenance entry?');
    if (confirmed) {
        const m = maintenanceData.find(item => String(item.id) === String(id));
        if (m && m.status === 'In Workshop') {
            const truck = trucksData.find(t => t.number === m.truck);
            if (truck) truck.status = 'available';
        }
        
        maintenanceData = maintenanceData.filter(item => String(item.id) !== String(id));
        saveData();
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderMaintenance();
        showSuccessToast('Maintenance Deleted', 'Maintenance entry removed.');
    }
};

window.editFuelLog = function(id) {
    if (!checkAdminAuth()) return;
    const log = fuelLogsData.find(item => String(item.id) === String(id));
    if (log) {
        editingFuelLogId = id;
        const titleEl = document.querySelector('#fuel-log-modal h3');
        if (titleEl) titleEl.innerText = 'Edit Fuel Fill Transaction';
        const submitEl = document.querySelector('#fuel-log-form button[type="submit"]');
        if (submitEl) submitEl.innerText = 'Save Changes';
        
        document.getElementById('fuel-truck-search').value = log.truck;
        document.getElementById('fuel-driver-search').value = log.driver;
        document.getElementById('fuel-volume').value = parseFloat(log.volume);
        document.getElementById('fuel-cost').value = parseFloat(log.cost);
        document.getElementById('fuel-odometer').value = log.odometer;
        document.getElementById('fuel-location').value = log.location;
        
        const fuelLogModal = document.getElementById('fuel-log-modal');
        if (fuelLogModal) fuelLogModal.classList.add('active');
    }
};

window.deleteFuelLog = async function(id) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Delete Fuel Log', 'Are you sure you want to delete this fuel log?');
    if (confirmed) {
        fuelLogsData = fuelLogsData.filter(item => String(item.id) !== String(id));
        saveData();
        renderFuelLogs();
        showSuccessToast('Fuel Log Deleted', 'Fuel transaction log deleted.');
    }
};

window.editDocument = function(id) {
    if (!checkAdminAuth()) return;
    const doc = documentsData.find(item => String(item.id) === String(id));
    if (doc) {
        editingDocId = id;
        document.getElementById('document-modal-title').innerText = 'Edit Document Details';
        document.getElementById('document-submit-btn').innerText = 'Save Changes';
        
        document.getElementById('doc-name').value = doc.name;
        document.getElementById('doc-meta').value = doc.meta;
        document.getElementById('doc-status').value = doc.status;
        
        const fileInput = document.getElementById('doc-file-input');
        if (fileInput) fileInput.removeAttribute('required');
        
        const docModal = document.getElementById('document-modal');
        if (docModal) docModal.classList.add('active');
    }
};

window.deleteDocument = async function(id) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Delete Document', 'Are you sure you want to delete this document?');
    if (confirmed) {
        documentsData = documentsData.filter(item => String(item.id) !== String(id));
        saveData();
        renderDocuments();
        showSuccessToast('Document Deleted', 'Document successfully deleted.');
    }
};



// 9. Modal setup
function setupModals() {
    
    // Modal Selectors
    const contactModal = document.getElementById('contact-modal');
    const addTruckModal = document.getElementById('add-truck-modal');
    const bookingModal = document.getElementById('booking-modal');
    const maintModal = document.getElementById('maintenance-modal');
    const successModal = document.getElementById('success-modal');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const fuelLogModal = document.getElementById('fuel-log-modal');
    const registerDriverModal = document.getElementById('register-driver-modal');
    const addTrailerModal = document.getElementById('add-trailer-modal');
    
    // Triggers
    const openContactBtns = document.querySelectorAll('.open-contact-btn');
    const openAddTruckBtn = document.getElementById('open-add-truck-btn');
    const openBookingBtn = document.getElementById('open-booking-btn');
    const openMaintBtn = document.getElementById('btn-schedule-maintenance');
    const openAddTrailerBtn = document.getElementById('open-add-trailer-btn');
    
    // Closers
    const closeContact = document.getElementById('close-contact-modal');
    const cancelContact = document.getElementById('cancel-contact-btn');
    
    const closeAddTruck = document.getElementById('close-add-truck-modal');
    const cancelAddTruck = document.getElementById('cancel-add-truck-btn');
    
    const closeBooking = document.getElementById('close-booking-modal');
    const cancelBooking = document.getElementById('cancel-booking-btn');
    
    const closeMaint = document.getElementById('close-maintenance-modal');
    const cancelMaint = document.getElementById('cancel-maint-btn');
    
    const successClose = document.getElementById('success-close-btn');
    const closeAdminLogin = document.getElementById('close-admin-login-modal');
    const cancelAdminLogin = document.getElementById('cancel-admin-login-btn');

    const closeFuelLog = document.getElementById('close-fuel-log-modal');
    const cancelFuelLog = document.getElementById('cancel-fuel-log-btn');
    const closeRegisterDriver = document.getElementById('close-register-driver-modal');
    const cancelRegisterDriver = document.getElementById('cancel-register-driver-btn');
    const closeAddTrailer = document.getElementById('close-add-trailer-modal');
    const cancelAddTrailer = document.getElementById('cancel-add-trailer-btn');

    // Helper functions
    const openModal = (modal) => modal.classList.add('active');
    const closeModal = (modal) => modal.classList.remove('active');

    // Attach listeners
    openContactBtns.forEach(btn => btn.addEventListener('click', () => openModal(contactModal)));
    closeContact.addEventListener('click', () => closeModal(contactModal));
    cancelContact.addEventListener('click', () => closeModal(contactModal));
    
    if (openAddTruckBtn) {
        openAddTruckBtn.addEventListener('click', () => {
            if (!checkAdminAuth()) return;
            openModal(addTruckModal);
        });
    }
    closeAddTruck.addEventListener('click', () => closeModal(addTruckModal));
    cancelAddTruck.addEventListener('click', () => closeModal(addTruckModal));

    if (openAddTrailerBtn) {
        openAddTrailerBtn.addEventListener('click', () => {
            if (!checkAdminAuth()) return;
            editingTrailerId = null;
            document.getElementById('add-trailer-title').innerText = 'Register New Fleet Trailer';
            document.getElementById('trailer-submit-btn').innerText = 'Add Trailer';
            document.getElementById('add-trailer-form').reset();
            populateModalDropdowns();
            openModal(addTrailerModal);
        });
    }
    if (closeAddTrailer) closeAddTrailer.addEventListener('click', () => closeModal(addTrailerModal));
    if (cancelAddTrailer) cancelAddTrailer.addEventListener('click', () => closeModal(addTrailerModal));
    
    const requestBookingBtn = document.getElementById('request-booking-btn');
    
    if (openBookingBtn) {
        openBookingBtn.addEventListener('click', () => {
            if (!checkAdminAuth()) return;
            editingBookingId = null;
            const titleEl = document.getElementById('trip-modal-title');
            if (titleEl) titleEl.innerText = 'Schedule Daily Trip';
            const submitEl = document.getElementById('trip-submit-btn');
            if (submitEl) submitEl.innerText = 'Log Trip';
            
            const statusGroup = document.getElementById('trip-status-group');
            if (statusGroup) statusGroup.style.display = 'none';
            
            // Show truck select and make it required
            const truckSelectRow = document.getElementById('booking-truck-select').closest('.form-group');
            if (truckSelectRow) {
                truckSelectRow.style.display = 'block';
            }
            document.getElementById('booking-truck-select').setAttribute('required', 'required');
            
            document.getElementById('create-booking-form').reset();
            populateModalDropdowns();
            openModal(bookingModal);
        });
    }
    
    closeBooking.addEventListener('click', () => closeModal(bookingModal));
    cancelBooking.addEventListener('click', () => closeModal(bookingModal));
    
    if (openMaintBtn) {
        openMaintBtn.addEventListener('click', () => {
            if (!checkAdminAuth()) return;
            editingMaintId = null;
            const titleEl = document.querySelector('#maintenance-modal h3');
            if (titleEl) titleEl.innerText = 'Schedule Maintenance Workshop Entry';
            const submitEl = document.querySelector('#schedule-maintenance-form button[type="submit"]');
            if (submitEl) {
                submitEl.innerText = 'Schedule Service';
                submitEl.className = 'btn btn-yellow';
            }
            document.getElementById('schedule-maintenance-form').reset();
            populateModalDropdowns();
            openModal(maintModal);
        });
    }
    closeMaint.addEventListener('click', () => closeModal(maintModal));
    cancelMaint.addEventListener('click', () => closeModal(maintModal));
    
    if (closeAdminLogin) closeAdminLogin.addEventListener('click', () => closeModal(adminLoginModal));
    if (cancelAdminLogin) cancelAdminLogin.addEventListener('click', () => closeModal(adminLoginModal));
    
    if (closeFuelLog) closeFuelLog.addEventListener('click', () => closeModal(fuelLogModal));
    if (cancelFuelLog) cancelFuelLog.addEventListener('click', () => closeModal(fuelLogModal));
    if (closeRegisterDriver) closeRegisterDriver.addEventListener('click', () => closeModal(registerDriverModal));
    if (cancelRegisterDriver) cancelRegisterDriver.addEventListener('click', () => closeModal(registerDriverModal));

    // Document Modal triggers
    const openDocBtn = document.getElementById('upload-doc-btn');
    const docModal = document.getElementById('document-modal');
    const closeDocModal = document.getElementById('close-document-modal');
    const cancelDocBtn = document.getElementById('cancel-document-btn');
    if (openDocBtn && docModal) {
        openDocBtn.addEventListener('click', () => {
            editingDocId = null;
            document.getElementById('document-modal-title').innerText = 'Upload New Document';
            document.getElementById('document-submit-btn').innerText = 'Upload Document';
            document.getElementById('document-form').reset();
            const fileInput = document.getElementById('doc-file-input');
            if (fileInput) fileInput.setAttribute('required', 'required');
            openModal(docModal);
        });
    }
    if (closeDocModal) closeDocModal.addEventListener('click', () => closeModal(docModal));
    if (cancelDocBtn) cancelDocBtn.addEventListener('click', () => closeModal(docModal));

    // Helper function to build a clean printable table (with only selected rows if checkboxes are checked)
    function getPrintableTableHtml(tableBodyId, checkboxClass) {
        const originalTable = document.getElementById(tableBodyId).closest('table');
        const checkedBoxes = document.querySelectorAll(`.${checkboxClass}:checked`);
        
        // If checkboxes are checked, print only selected rows. Otherwise print all rows.
        const useSelectedOnly = checkedBoxes.length > 0;
        
        // Find the index of the cost column
        const headers = originalTable.querySelectorAll('thead th');
        let costColumnIndex = -1;
        headers.forEach((th, idx) => {
            if (th.innerText.toLowerCase().includes('cost')) {
                costColumnIndex = idx;
            }
        });

        // Clone the table structure
        const cloneTable = originalTable.cloneNode(true);
        const cloneBody = cloneTable.querySelector('tbody');
        cloneBody.innerHTML = ''; // clear rows
        
        let totalCost = 0;
        const rows = originalTable.querySelectorAll('tbody tr');
        rows.forEach((row) => {
            const checkbox = row.querySelector(`.${checkboxClass}`);
            if (!useSelectedOnly || (checkbox && checkbox.checked)) {
                const cloneRow = row.cloneNode(true);
                
                // Add to total cost if column index exists
                if (costColumnIndex !== -1) {
                    const cells = row.querySelectorAll('td');
                    if (cells[costColumnIndex]) {
                        const costText = cells[costColumnIndex].innerText || '';
                        const parsedCost = parseFloat(costText.replace(/[^0-9.]/g, '')) || 0;
                        totalCost += parsedCost;
                    }
                }

                // Remove checkbox cell (the first cell)
                const firstCell = cloneRow.querySelector('td:first-child');
                if (firstCell && firstCell.querySelector('input[type="checkbox"]')) {
                    firstCell.remove();
                }
                
                // Remove action cell (the last cell)
                const lastCell = cloneRow.querySelector('td:last-child');
                if (lastCell && (lastCell.querySelector('.table-actions') || lastCell.querySelector('.btn') || lastCell.innerText.trim() === 'Serviced')) {
                    lastCell.remove();
                }
                
                cloneBody.appendChild(cloneRow);
            }
        });
        
        // Clean up cloneTable headers
        const firstHeader = cloneTable.querySelector('thead th:first-child');
        if (firstHeader && (firstHeader.querySelector('input[type="checkbox"]') || firstHeader.innerText.trim().toLowerCase() === 'select')) {
            firstHeader.remove();
        }
        const lastHeader = cloneTable.querySelector('thead th:last-child');
        if (lastHeader && (lastHeader.classList.contains('admin-only-header') || lastHeader.innerText.trim().toLowerCase() === 'actions')) {
            lastHeader.remove();
        }
        
        return {
            html: cloneTable.outerHTML,
            totalCost: totalCost
        };
    }

    // Export PDF Print & Download triggers
    let currentExportType = null;
    const printFuelBtn = document.getElementById('print-fuel-btn');
    const printMaintBtn = document.getElementById('print-maint-btn');
    const exportPdfModal = document.getElementById('export-pdf-modal');
    const btnExportPrint = document.getElementById('btn-export-print');
    const btnExportDownload = document.getElementById('btn-export-download');
    const btnExportCancel = document.getElementById('btn-export-cancel');
    
    if (printFuelBtn) {
        printFuelBtn.addEventListener('click', () => {
            currentExportType = 'fuel';
            openModal(exportPdfModal);
        });
    }
    
    if (printMaintBtn) {
        printMaintBtn.addEventListener('click', () => {
            currentExportType = 'maint';
            openModal(exportPdfModal);
        });
    }
    
    if (btnExportCancel) {
        btnExportCancel.addEventListener('click', () => {
            closeModal(exportPdfModal);
        });
    }
    
    if (btnExportPrint) {
        btnExportPrint.addEventListener('click', () => {
            closeModal(exportPdfModal);
            if (currentExportType === 'fuel') {
                triggerFuelPrint();
            } else if (currentExportType === 'maint') {
                triggerMaintPrint();
            }
        });
    }
    
    if (btnExportDownload) {
        btnExportDownload.addEventListener('click', () => {
            closeModal(exportPdfModal);
            if (currentExportType === 'fuel') {
                triggerFuelDownload();
            } else if (currentExportType === 'maint') {
                triggerMaintDownload();
            }
        });
    }

    function triggerFuelPrint() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up blocked. Please allow popups to export reports.');
            return;
        }
        
        let stylesHtml = '';
        document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
            stylesHtml += el.outerHTML;
        });
        
        const fuelPrintDate = formatDate(new Date());
        const printData = getPrintableTableHtml('fuel-table-body', 'fuel-print-select');
        const tableHtml = printData.html;
        const totalCost = printData.totalCost;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fuel Refill Logs Report</title>
                ${stylesHtml}
                <style>
                    body { background: white !important; color: black !important; padding: 40px !important; }
                    .print-only-header { display: block !important; margin-bottom: 24px; }
                    .data-table { width: 100% !important; border-collapse: collapse !important; }
                    .data-table th, .data-table td { border: 1px solid #cbd5e1 !important; padding: 10px 8px !important; color: black !important; }
                    .admin-only-header, .admin-only-btn { display: none !important; }
                    td .table-actions { display: none !important; }
                </style>
            </head>
            <body>
                <div class="print-only-header">
                    <h2 style="font-size: 24px; color: #1e3a8a; margin-bottom: 4px;">IMRAN AKTAR'S TRANSPORTS</h2>
                    <h3 style="font-size: 18px; color: #475569; margin-bottom: 8px;">Fuel Refill Logs Report</h3>
                    <p style="font-size: 12px; color: #94a3b8;">Generated on: ${fuelPrintDate}</p>
                </div>
                ${tableHtml}
                <div style="margin-top: 20px; padding: 15px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif;">
                    <span style="font-size: 16px; font-weight: 600; color: #475569;">Total Fuel Cost:</span>
                    <span style="font-size: 20px; font-weight: 700; color: #1e3a8a;">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} OMR</span>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function triggerMaintPrint() {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Pop-up blocked. Please allow popups to export reports.');
            return;
        }
        
        let stylesHtml = '';
        document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
            stylesHtml += el.outerHTML;
        });
        
        const maintPrintDate = formatDate(new Date());
        const printData = getPrintableTableHtml('maintenance-table-body', 'maint-print-select');
        const tableHtml = printData.html;
        const totalCost = printData.totalCost;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Maintenance & Repairs Logs Report</title>
                ${stylesHtml}
                <style>
                    body { background: white !important; color: black !important; padding: 40px !important; }
                    .print-only-header { display: block !important; margin-bottom: 24px; }
                    .data-table { width: 100% !important; border-collapse: collapse !important; }
                    .data-table th, .data-table td { border: 1px solid #cbd5e1 !important; padding: 10px 8px !important; color: black !important; }
                    .admin-only-header, .admin-only-btn { display: none !important; }
                    td .btn, td span { display: none !important; }
                    td div { display: none !important; }
                </style>
            </head>
            <body>
                <div class="print-only-header">
                    <h2 style="font-size: 24px; color: #1e3a8a; margin-bottom: 4px;">IMRAN AKTAR'S TRANSPORTS</h2>
                    <h3 style="font-size: 18px; color: #475569; margin-bottom: 8px;">Maintenance & Repairs Logs Report</h3>
                    <p style="font-size: 12px; color: #94a3b8;">Generated on: ${maintPrintDate}</p>
                </div>
                ${tableHtml}
                <div style="margin-top: 20px; padding: 15px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif;">
                    <span style="font-size: 16px; font-weight: 600; color: #475569;">Total Maintenance Cost:</span>
                    <span style="font-size: 20px; font-weight: 700; color: #1e3a8a;">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} OMR</span>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    function triggerFuelDownload() {
        if (typeof html2pdf === 'undefined') {
            alert('PDF generation library is loading. Please try again in a moment.');
            return;
        }
        const fuelPrintDate = formatDate(new Date());
        const printData = getPrintableTableHtml('fuel-table-body', 'fuel-print-select');
        const tableHtml = printData.html;
        const totalCost = printData.totalCost;
        
        const element = document.createElement('div');
        element.style.padding = '30px';
        element.style.color = 'black';
        element.style.background = 'white';
        element.style.fontFamily = 'sans-serif';
        element.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h2 style="font-size: 24px; color: #1e3a8a; margin: 0 0 4px 0; font-family: sans-serif;">IMRAN AKTAR'S TRANSPORTS</h2>
                <h3 style="font-size: 18px; color: #475569; margin: 0 0 8px 0; font-family: sans-serif;">Fuel Refill Logs Report</h3>
                <p style="font-size: 12px; color: #94a3b8; margin: 0; font-family: sans-serif;">Generated on: ${fuelPrintDate}</p>
            </div>
            ${tableHtml}
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; box-sizing: border-box;">
                <span style="font-size: 16px; font-weight: 600; color: #475569;">Total Fuel Cost:</span>
                <span style="font-size: 20px; font-weight: 700; color: #1e3a8a;">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} OMR</span>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .data-table { width: 100% !important; border-collapse: collapse !important; margin-top: 15px; }
            .data-table th, .data-table td { border: 1px solid #cbd5e1 !important; padding: 10px 8px !important; color: black !important; text-align: left; font-size: 12px; }
            .data-table th { background-color: #f1f5f9 !important; font-weight: 600; }
            .admin-only-header, .admin-only-btn { display: none !important; }
            td .table-actions { display: none !important; }
        `;
        element.appendChild(style);
        
        const opt = {
            margin:       10,
            filename:     `Fuel_Refill_Logs_Report_${new Date().toISOString().slice(0,10)}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    }

    function triggerMaintDownload() {
        if (typeof html2pdf === 'undefined') {
            alert('PDF generation library is loading. Please try again in a moment.');
            return;
        }
        const maintPrintDate = formatDate(new Date());
        const printData = getPrintableTableHtml('maintenance-table-body', 'maint-print-select');
        const tableHtml = printData.html;
        const totalCost = printData.totalCost;
        
        const element = document.createElement('div');
        element.style.padding = '30px';
        element.style.color = 'black';
        element.style.background = 'white';
        element.style.fontFamily = 'sans-serif';
        element.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h2 style="font-size: 24px; color: #1e3a8a; margin: 0 0 4px 0; font-family: sans-serif;">IMRAN AKTAR'S TRANSPORTS</h2>
                <h3 style="font-size: 18px; color: #475569; margin: 0 0 8px 0; font-family: sans-serif;">Maintenance & Repairs Logs Report</h3>
                <p style="font-size: 12px; color: #94a3b8; margin: 0; font-family: sans-serif;">Generated on: ${maintPrintDate}</p>
            </div>
            ${tableHtml}
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #cbd5e1; background-color: #f8fafc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; box-sizing: border-box;">
                <span style="font-size: 16px; font-weight: 600; color: #475569;">Total Maintenance Cost:</span>
                <span style="font-size: 20px; font-weight: 700; color: #1e3a8a;">${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} OMR</span>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .data-table { width: 100% !important; border-collapse: collapse !important; margin-top: 15px; }
            .data-table th, .data-table td { border: 1px solid #cbd5e1 !important; padding: 10px 8px !important; color: black !important; text-align: left; font-size: 12px; }
            .data-table th { background-color: #f1f5f9 !important; font-weight: 600; }
            .admin-only-header, .admin-only-btn { display: none !important; }
            td .btn, td span { display: none !important; }
            td div { display: none !important; }
        `;
        element.appendChild(style);
        
        const opt = {
            margin:       10,
            filename:     `Maintenance_Logs_Report_${new Date().toISOString().slice(0,10)}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
    }
    
    successClose.addEventListener('click', () => closeModal(successModal));
    
    // Close on clicking backdrop
    [contactModal, addTruckModal, bookingModal, maintModal, successModal, adminLoginModal, fuelLogModal, registerDriverModal, docModal, addTrailerModal, exportPdfModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        }
    });

    // Admin Sidebar Menu Toggle Login/Logout Action
    const adminLoginMenuItem = document.getElementById('admin-login-menu-item');
    if (adminLoginMenuItem) {
        adminLoginMenuItem.addEventListener('click', () => {
            if (isAdminLoggedIn) {
                // Logout action
                isAdminLoggedIn = false;
                sessionStorage.setItem('isAdminLoggedIn', 'false');
                updateAuthUI();
                showSuccessToast('Logged Out', 'You have successfully logged out of admin mode.');
            } else {
                openAdminLoginModal();
            }
        });
    }

    // Form Submissions
    
    // A. Contact Form
    const contactAttachment = document.getElementById('contact-attachment');
    const fileUploadText = document.getElementById('file-upload-text');
    if (contactAttachment && fileUploadText) {
        contactAttachment.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileUploadText.innerText = e.target.files[0].name;
                fileUploadText.style.color = 'var(--primary-green-bright)';
                fileUploadText.style.fontWeight = '600';
            } else {
                fileUploadText.innerText = 'Choose image, video or document...';
                fileUploadText.style.color = 'var(--text-secondary)';
                fileUploadText.style.fontWeight = 'normal';
            }
        });
    }

    let isSubmittingContact = false;
    const contactIframe = document.createElement('iframe');
    contactIframe.name = 'contact-submit-iframe';
    contactIframe.id = 'contact-submit-iframe';
    contactIframe.style.display = 'none';
    document.body.appendChild(contactIframe);
    
    const contactForm = document.getElementById('contact-us-form');
    if (contactForm) {
        contactForm.target = 'contact-submit-iframe';
    }

    contactForm.addEventListener('submit', (e) => {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        const name = document.getElementById('contact-name').value.trim();
        const subject = `Inquiry from ${name}`;
        
        const recipientEmail = localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com";
        const web3formsKey = localStorage.getItem('web3formsKey');
        
        // Dynamically set hidden fields
        const web3KeyInput = document.getElementById('web3forms-access-key-hidden');
        if (web3KeyInput) {
            web3KeyInput.value = web3formsKey || '';
        }
        
        const subInput = document.getElementById('formsubmit-subject-hidden');
        if (subInput) {
            subInput.value = subject;
        }
        
        // Set form action based on whether we have web3forms key or not
        if (web3formsKey) {
            form.action = 'https://api.web3forms.com/submit';
        } else {
            form.action = `https://formsubmit.co/${recipientEmail}`;
        }
        
        // Show loading state on button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite; margin-right: 8px; display: inline-block; vertical-align: middle;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-dashoffset="8" style="opacity: 0.25;"></circle>
                    <path d="M4 12a8 8 0 018-8V4" stroke="currentColor" stroke-linecap="round"></path>
                </svg>
                Sending...
            `;
        }
        
        // Add css animation for spin dynamically to avoid styling conflicts
        if (!document.getElementById('spinner-style-rule')) {
            const style = document.createElement('style');
            style.id = 'spinner-style-rule';
            style.innerHTML = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        isSubmittingContact = true;
    });

    contactIframe.addEventListener('load', () => {
        if (isSubmittingContact) {
            isSubmittingContact = false;
            
            const submitBtn = document.querySelector('#contact-us-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }
            
            const recipientEmail = localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com";
            showSuccessToast('Message Sent', `Your message and attachment have been sent directly to: ${recipientEmail}. Note: If this is the first submission to this address, please check your inbox to confirm/activate it with FormSubmit.`);
            
            const contactModal = document.getElementById('contact-modal');
            if (contactModal) {
                contactModal.classList.remove('active');
            }
            
            if (contactForm) {
                contactForm.reset();
            }
            
            if (fileUploadText) {
                fileUploadText.innerText = 'Choose image, video or document...';
                fileUploadText.style.color = 'var(--text-secondary)';
                fileUploadText.style.fontWeight = 'normal';
            }
        }
    });
    
    // B. Add Truck Form
    document.getElementById('add-truck-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!checkAdminAuth()) return;
        const plate = document.getElementById('truck-plate').value.toUpperCase();
        const model = document.getElementById('truck-model').value;
        const mulkiyaExpiry = document.getElementById('truck-mulkiya-expiry').value;
        const vocExpiry = document.getElementById('truck-voc-expiry').value;
        const type = document.getElementById('truck-type').value;
        const status = document.getElementById('truck-status').value;
        const location = document.getElementById('truck-location').value;
        
        // Pick an image based on model
        let image = 'images/truck_green_container.png';
        if (type === 'Tanker') image = 'images/truck_white_tanker.png';
        else if (type === 'Box Body' || type === 'Closed Body') image = 'images/truck_dark_box.png';
        
        const newId = trucksData.length > 0 ? Math.max(...trucksData.map(t => t.id)) + 1 : 1;
        
        trucksData.push({
            id: newId,
            number: plate,
            model: model,
            mulkiyaExpiry: mulkiyaExpiry,
            vocExpiry: vocExpiry,
            location: location,
            type: type,
            status: status,
            image: image
        });
        
        saveData();
        closeModal(addTruckModal);
        document.getElementById('add-truck-form').reset();
        document.getElementById('truck-location').value = 'Salalah/Oman';
        
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderStatusManager();
        populateModalDropdowns();
        
        showSuccessToast('Vehicle Registered', `Truck ${plate} has been successfully added to the active fleet registry.`);
    });
    
    // C. Daily Trip Form Submit
    document.getElementById('create-booking-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!checkAdminAuth()) return;
        
        const client = document.getElementById('booking-client').value;
        const origin = document.getElementById('booking-origin').value;
        const dest = document.getElementById('booking-dest').value;
        const truckNum = document.getElementById('booking-truck-select').value;
        const driverName = document.getElementById('booking-driver-select').value;
        const weight = document.getElementById('booking-weight').value;
        const containerNumber = document.getElementById('booking-container-number').value.trim();
        const date = document.getElementById('booking-date').value;
        
        if (editingBookingId) {
            const bk = bookingsData.find(b => b.id === editingBookingId);
            if (bk) {
                // If truck is changing, update old and new truck availabilities
                if (bk.truck !== truckNum) {
                    const oldTruck = trucksData.find(t => t.number === bk.truck);
                    if (oldTruck) oldTruck.status = 'available';
                    
                    const newTruck = trucksData.find(t => t.number === truckNum);
                    if (newTruck) newTruck.status = 'unavailable';
                }
                
                bk.client = client;
                bk.route = `${origin} ➔ ${dest}`;
                bk.truck = truckNum;
                bk.driver = driverName;
                bk.weight = weight;
                bk.containerNumber = containerNumber;
                bk.date = date;
                bk.status = document.getElementById('booking-status').value;
                
                showSuccessToast('Trip Updated', `Trip ${editingBookingId} has been successfully updated.`);
            }
            editingBookingId = null;
        } else {
            const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
            bookingsData.unshift({
                id: tripId,
                client: client,
                route: `${origin} ➔ ${dest}`,
                truck: truckNum,
                driver: driverName,
                weight: weight,
                containerNumber: containerNumber,
                date: date,
                status: 'Scheduled'
            });
            const truck = trucksData.find(t => t.number === truckNum);
            if (truck) {
                truck.status = 'unavailable';
            }
            showSuccessToast('Trip Scheduled', `Trip ${tripId} has been scheduled and assigned to ${truckNum}.`);
        }
        
        saveData();
        closeModal(bookingModal);
        document.getElementById('create-booking-form').reset();
        
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderBookings();
        populateModalDropdowns();
    });
    
    // D. Maintenance Schedule Form
    document.getElementById('schedule-maintenance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!checkAdminAuth()) return;
        const truckNum = document.getElementById('maint-truck-select').value;
        const type = document.getElementById('maint-type').value;
        const issue = document.getElementById('maint-issue').value;
        
        if (editingMaintId) {
            const m = maintenanceData.find(item => String(item.id) === String(editingMaintId));
            if (m) {
                m.truck = truckNum;
                m.type = type;
                m.issue = issue;
            }
            showSuccessToast('Maintenance Updated', `Maintenance entry for ${truckNum} has been updated.`);
            editingMaintId = null;
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            const eta = new Date();
            eta.setDate(eta.getDate() + 3);
            const etaStr = eta.toISOString().split('T')[0];
            
            maintenanceData.unshift({
                id: Date.now(),
                truck: truckNum,
                type: type,
                issue: issue,
                date: todayStr,
                eta: etaStr,
                cost: Math.floor(50 + Math.random() * 200),
                status: 'In Workshop'
            });
            
            const truck = trucksData.find(t => t.number === truckNum);
            if (truck) {
                truck.status = 'maintenance';
            }
            showSuccessToast('Maintenance Scheduled', `Truck ${truckNum} is scheduled for ${type}.`);
        }
        
        saveData();
        closeModal(maintModal);
        document.getElementById('schedule-maintenance-form').reset();
        
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderMaintenance();
        populateModalDropdowns();
    });
    
    // E. Add Fuel Log trigger modal helper (opens searchable fuel log modal)
    const addFuelBtn = document.getElementById('add-fuel-log-btn');
    if (addFuelBtn) {
        addFuelBtn.addEventListener('click', () => {
            if (!checkAdminAuth()) return;
            editingFuelLogId = null;
            const titleEl = document.querySelector('#fuel-log-modal h3');
            if (titleEl) titleEl.innerText = 'Log Fuel Fill Transaction';
            const submitEl = document.querySelector('#fuel-log-form button[type="submit"]');
            if (submitEl) submitEl.innerText = 'Log Refill';
            document.getElementById('fuel-log-form').reset();
            openModal(fuelLogModal);
        });
    }
    
    // Live Search Autocomplete Suggestions for Fuel Log Truck Search
    const fuelTruckSearch = document.getElementById('fuel-truck-search');
    const fuelTruckResults = document.getElementById('fuel-truck-results');
    if (fuelTruckSearch && fuelTruckResults) {
        fuelTruckSearch.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            fuelTruckResults.innerHTML = '';
            
            if (!val) {
                fuelTruckResults.style.display = 'none';
                return;
            }
            
            const matches = trucksData.filter(t => 
                t.number.toLowerCase().includes(val) || 
                t.model.toLowerCase().includes(val)
            );
            
            if (matches.length === 0) {
                fuelTruckResults.style.display = 'none';
                return;
            }
            
            matches.forEach(t => {
                const item = document.createElement('div');
                item.className = 'search-results-item';
                item.innerText = `${t.number} (${t.model})`;
                item.addEventListener('click', () => {
                    fuelTruckSearch.value = t.number;
                    fuelTruckResults.style.display = 'none';
                });
                fuelTruckResults.appendChild(item);
            });
            fuelTruckResults.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target !== fuelTruckSearch && e.target !== fuelTruckResults) {
                fuelTruckResults.style.display = 'none';
            }
        });
    }

    // Live Search Autocomplete Suggestions for Fuel Log Driver Search
    const fuelDriverSearch = document.getElementById('fuel-driver-search');
    const fuelDriverResults = document.getElementById('fuel-driver-results');
    if (fuelDriverSearch && fuelDriverResults) {
        fuelDriverSearch.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            fuelDriverResults.innerHTML = '';
            
            if (!val) {
                fuelDriverResults.style.display = 'none';
                return;
            }
            
            const matches = driversData.filter(d => 
                d.name.toLowerCase().includes(val)
            );
            
            if (matches.length === 0) {
                fuelDriverResults.style.display = 'none';
                return;
            }
            
            matches.forEach(d => {
                const item = document.createElement('div');
                item.className = 'search-results-item';
                item.innerText = d.name;
                item.addEventListener('click', () => {
                    fuelDriverSearch.value = d.name;
                    fuelDriverResults.style.display = 'none';
                });
                fuelDriverResults.appendChild(item);
            });
            fuelDriverResults.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target !== fuelDriverSearch && e.target !== fuelDriverResults) {
                fuelDriverResults.style.display = 'none';
            }
        });
    }

    // Fuel Log Form submit
    const fuelLogForm = document.getElementById('fuel-log-form');
    if (fuelLogForm) {
        fuelLogForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!checkAdminAuth()) return;
            
            const plate = document.getElementById('fuel-truck-search').value.toUpperCase().trim();
            const driver = document.getElementById('fuel-driver-search').value.trim();
            const volume = document.getElementById('fuel-volume').value;
            const cost = document.getElementById('fuel-cost').value;
            const odometer = document.getElementById('fuel-odometer').value;
            const location = document.getElementById('fuel-location').value;
            
            const truckExists = trucksData.some(t => t.number.toLowerCase() === plate.toLowerCase());
            if (!truckExists) {
                alert('Vehicle not found in registry. Please search and select an active truck.');
                return;
            }
            
            if (editingFuelLogId) {
                const log = fuelLogsData.find(item => String(item.id) === String(editingFuelLogId));
                if (log) {
                    log.truck = plate;
                    log.driver = driver;
                    log.volume = volume.includes('L') ? volume : volume + ' L';
                    log.cost = cost.includes('OMR') ? cost : cost + ' OMR';
                    log.location = location;
                    log.odometer = odometer.includes('km') ? odometer : odometer + ' km';
                }
                showSuccessToast('Fuel Log Updated', 'Fuel transaction details updated successfully.');
                editingFuelLogId = null;
            } else {
                const todayStr = new Date().toISOString().split('T')[0];
                fuelLogsData.unshift({
                    id: Date.now(),
                    date: todayStr,
                    truck: plate,
                    driver: driver,
                    volume: volume + ' L',
                    cost: cost + ' OMR',
                    location: location,
                    odometer: odometer.includes('km') ? odometer : odometer + ' km'
                });
                showSuccessToast('Fuel Log Added', 'Refill transaction registered successfully.');
            }
            
            saveData();
            renderFuelLogs();
            closeModal(fuelLogModal);
            fuelLogForm.reset();
        });
    }
    
    // F. Register Driver trigger (opens Register Driver modal)
    const addDriverBtn = document.getElementById('add-driver-btn');
    if (addDriverBtn) {
        addDriverBtn.addEventListener('click', () => {
            if (!checkAdminAuth()) return;
            editingDriverId = null;
            document.getElementById('register-driver-title').innerText = 'Register Professional Driver';
            document.getElementById('driver-submit-btn').innerText = 'Register Driver';
            document.getElementById('register-driver-form').reset();
            document.getElementById('driver-status-input').value = 'Available';
            document.getElementById('driver-attendance-input').value = 'Present';
            openModal(registerDriverModal);
        });
    }

    // Register Driver Form submit
    const registerDriverForm = document.getElementById('register-driver-form');
    if (registerDriverForm) {
        registerDriverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!checkAdminAuth()) return;
            
            const name = document.getElementById('driver-name-input').value.trim();
            const phone = document.getElementById('driver-phone-input').value.trim();
            const license = document.getElementById('driver-license-input').value.trim();
            const licenseExpiry = document.getElementById('driver-license-expiry-input').value;
            const status = document.getElementById('driver-status-input').value;
            const attendance = document.getElementById('driver-attendance-input').value;
            
            if (editingDriverId) {
                const d = driversData.find(item => String(item.id) === String(editingDriverId));
                if (d) {
                    d.name = name;
                    d.phone = phone;
                    d.license = license;
                    d.licenseExpiry = licenseExpiry;
                    d.status = status;
                    d.attendance = attendance;
                }
                showSuccessToast('Driver Updated', `Driver profile for ${name} updated successfully.`);
                editingDriverId = null;
            } else {
                driversData.push({
                    id: Date.now(),
                    name: name,
                    status: status,
                    phone: phone,
                    license: license,
                    licenseExpiry: licenseExpiry,
                    attendance: attendance
                });
                showSuccessToast('Driver Registered', `${name} has been added to the driver roster.`);
            }
            
            saveData();
            renderDrivers();
            closeModal(registerDriverModal);
            registerDriverForm.reset();
        });
    }

    // H. Document Form submit
    const documentForm = document.getElementById('document-form');
    if (documentForm) {
        documentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (editingDocId && !checkAdminAuth()) return;
            
            const name = document.getElementById('doc-name').value.trim();
            const meta = document.getElementById('doc-meta').value.trim();
            const status = document.getElementById('doc-status').value;
            const fileInput = document.getElementById('doc-file-input');
            
            const saveAndClose = (fileUrl) => {
                if (editingDocId) {
                    const doc = documentsData.find(item => String(item.id) === String(editingDocId));
                    if (doc) {
                        doc.name = name;
                        doc.meta = meta;
                        doc.status = status;
                        if (fileUrl) doc.file = fileUrl;
                    }
                    showSuccessToast('Document Updated', 'Permit/Document updated successfully.');
                    editingDocId = null;
                } else {
                    documentsData.unshift({
                        id: Date.now(),
                        name: name,
                        meta: meta,
                        status: status,
                        file: fileUrl || '#'
                    });
                    showSuccessToast('Document Uploaded', 'New document added successfully.');
                }
                
                saveData();
                renderDocuments();
                closeModal(document.getElementById('document-modal'));
                documentForm.reset();
            };

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = function(evt) {
                    saveAndClose(evt.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                saveAndClose(null);
            }
        });
    }


    
    // G. Settings form submit
    const settingsForm = document.getElementById('settings-profile-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!checkAdminAuth()) return;
            const companyName = document.getElementById('company-name-input').value;
            const phone = document.getElementById('phone-input').value;
            const email = document.getElementById('email-input').value;
            const location = document.getElementById('location-input').value;
            const web3formsKey = document.getElementById('web3forms-key-input').value;
            
            // Persist Settings in LocalStorage
            localStorage.setItem('profileCompanyName', companyName);
            localStorage.setItem('profilePhone', phone);
            localStorage.setItem('profileEmail', email);
            localStorage.setItem('profileLocation', location);
            localStorage.setItem('web3formsKey', web3formsKey);
            
            // Sync values to text fields
            syncSettingsDOM();
            
            showSuccessToast('Settings Saved', 'Business profile settings updated successfully.');
        });
    }

    // H. Admin login form submit
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('admin-login-username').value.trim();
            const pass = document.getElementById('admin-login-password').value;
            
            const expectedUser = localStorage.getItem('adminUsername') || 'admin';
            const expectedPass = localStorage.getItem('adminPassword') || 'password123';
            
            if (user === expectedUser && pass === expectedPass) {
                isAdminLoggedIn = true;
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                closeModal(adminLoginModal);
                updateAuthUI();
                adminLoginForm.reset();
                showSuccessToast('Admin Authenticated', 'Welcome back! Admin controls are now unlocked.');
            } else {
                const errorEl = document.getElementById('admin-login-error');
                if (errorEl) errorEl.style.display = 'block';
            }
        });
    }

    // I. Admin credentials settings form submit
    const adminSettingsForm = document.getElementById('settings-admin-form');
    if (adminSettingsForm) {
        adminSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!isAdminLoggedIn) return;
            
            const newUser = document.getElementById('admin-username-input').value.trim();
            const newPass = document.getElementById('admin-password-input').value;
            
            if (newUser) {
                localStorage.setItem('adminUsername', newUser);
                if (newPass) {
                    localStorage.setItem('adminPassword', newPass);
                }
                document.getElementById('admin-password-input').value = '';
                showSuccessToast('Credentials Updated', 'Admin login details updated successfully.');
                updateAuthUI();
            }
        });
    }
}

// Helper to populate select options in forms
function populateModalDropdowns() {
    const bookingTruckSelect = document.getElementById('booking-truck-select');
    const bookingDriverSelect = document.getElementById('booking-driver-select');
    const maintTruckSelect = document.getElementById('maint-truck-select');
    
    if (bookingTruckSelect) {
        bookingTruckSelect.innerHTML = '';
        const available = trucksData.filter(t => t.status === 'available');
        if (available.length === 0) {
            bookingTruckSelect.innerHTML = '<option value="" disabled>No Available Trucks</option>';
        } else {
            available.forEach(t => {
                bookingTruckSelect.innerHTML += `<option value="${t.number}">${t.number} (${t.model})</option>`;
            });
        }
    }

    if (bookingDriverSelect) {
        bookingDriverSelect.innerHTML = '';
        const availableDrivers = driversData.filter(d => d.status === 'Active' || d.status === 'Available');
        if (availableDrivers.length === 0) {
            bookingDriverSelect.innerHTML = '<option value="" disabled>No Available Drivers</option>';
        } else {
            availableDrivers.forEach(d => {
                bookingDriverSelect.innerHTML += `<option value="${d.name}">${d.name}</option>`;
            });
        }
    }
    
    if (maintTruckSelect) {
        maintTruckSelect.innerHTML = '';
        // Allow choosing any truck except those already in maintenance
        const valid = trucksData.filter(t => t.status !== 'maintenance');
        if (valid.length === 0) {
            maintTruckSelect.innerHTML = '<option value="" disabled>No Active Trucks</option>';
        } else {
            valid.forEach(t => {
                maintTruckSelect.innerHTML += `<option value="${t.number}">${t.number} (${t.model})</option>`;
            });
        }
    }

    const trailerTruckSelect = document.getElementById('trailer-truck-select');
    if (trailerTruckSelect) {
        trailerTruckSelect.innerHTML = '<option value="None">None (Unassigned)</option>';
        trucksData.forEach(t => {
            trailerTruckSelect.innerHTML += `<option value="${t.number}">${t.number} (${t.model})</option>`;
        });
    }
}

// Success Notification Helper
function showSuccessToast(title, description) {
    const successModal = document.getElementById('success-modal');
    if (!successModal) return;
    
    document.getElementById('success-title').innerText = title;
    document.getElementById('success-desc').innerText = description;
    
    successModal.classList.add('active');
}

function renderStatusManager() {
    const tbody = document.getElementById('status-manager-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const filtered = trucksData.filter(truck => {
        const query = statusManagerSearchFilter.toLowerCase();
        return truck.number.toLowerCase().includes(query) || 
               truck.model.toLowerCase().includes(query) || 
               truck.type.toLowerCase().includes(query) || 
               truck.location.toLowerCase().includes(query) || 
               truck.status.toLowerCase().includes(query);
    });
    
    filtered.forEach(truck => {
        const row = document.createElement('tr');
        
        let statusBadge = `<span class="status-badge status-available" style="position:relative; top:0; right:0;">Available</span>`;
        if (truck.status === 'unavailable') {
            statusBadge = `<span class="status-badge status-unavailable" style="position:relative; top:0; right:0;">Not Available</span>`;
        } else if (truck.status === 'maintenance') {
            statusBadge = `<span class="status-badge status-maintenance" style="position:relative; top:0; right:0;">Maintenance</span>`;
        }
        
        row.innerHTML = `
            <td style="font-weight:700; color:var(--primary-green-bright);">${truck.number}</td>
            <td>${truck.model}</td>
            <td>${truck.type}</td>
            <td>${truck.location}</td>
            <td>${statusBadge}</td>
            <td>
                <select class="table-filter" style="width: 100%; max-width: 200px; padding: 6px 12px; margin: 0;" 
                    onchange="updateTruckStatusValue(${truck.id}, this.value)">
                    <option value="available" ${truck.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="unavailable" ${truck.status === 'unavailable' ? 'selected' : ''}>Not Available</option>
                    <option value="maintenance" ${truck.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update Truck Status directly from Select Dropdown
window.updateTruckStatusValue = function(truckId, newStatus) {
    if (!checkAdminAuth()) {
        // Reset the select dropdown UI to original status if not authenticated
        renderStatusManager();
        return;
    }
    const truck = trucksData.find(t => t.id === truckId);
    if (truck) {
        truck.status = newStatus;
        
        // Sync lists and save
        saveData();
        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderStatusManager();
        populateModalDropdowns();
        showSuccessToast('Status Updated', `Truck ${truck.number} status has been updated to ${newStatus}.`);
    }
};

// Driver Portal Logic
function renderDriverPortal() {
    const authContainer = document.getElementById('driver-auth-container');
    const dashboardContainer = document.getElementById('driver-dashboard-container');
    
    if (!authContainer || !dashboardContainer) return;
    
    if (loggedDriverId) {
        const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
        if (driver) {
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            
            document.getElementById('driver-welcome-title').innerText = `Welcome, ${driver.name}`;
            
            const attBadge = document.getElementById('driver-attendance-badge');
            attBadge.innerText = driver.attendance || 'Absent';
            attBadge.className = 'widget-status-badge ' + (driver.attendance === 'Present' ? 'status-present' : 'status-absent');
            
            const availBadge = document.getElementById('driver-availability-badge');
            availBadge.innerText = driver.status || 'Unavailable';
            
            let availClass = 'status-unavailable';
            if (driver.status === 'Available') availClass = 'status-available';
            else if (driver.status === 'Unavailable' || driver.status === 'Off Duty') availClass = 'status-unavailable';
            availBadge.className = 'widget-status-badge ' + availClass;
            
            return;
        }
    }
    
    // Not logged in
    authContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';
    
    // Populate driver select dropdown
    const select = document.getElementById('driver-select-profile');
    if (select) {
        select.innerHTML = '<option value="" disabled selected>-- Select Your Profile --</option>';
        driversData.forEach(d => {
            const hasCreds = d.username ? ' (Credentials Configured)' : '';
            select.innerHTML += `<option value="${d.id}">${d.name}${hasCreds}</option>`;
        });
    }
}

function setupDriverPortal() {
    // Sub-tab selectors
    const tabLogin = document.getElementById('tab-driver-login');
    const tabRegister = document.getElementById('tab-driver-register');
    const loginCard = document.getElementById('driver-login-card');
    const registerCard = document.getElementById('driver-register-card');
    
    if (tabLogin && tabRegister && loginCard && registerCard) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginCard.style.display = 'block';
            registerCard.style.display = 'none';
        });
        
        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerCard.style.display = 'block';
            loginCard.style.display = 'none';
        });
    }

    const driverRegisterForm = document.getElementById('driver-register-form');
    if (driverRegisterForm) {
        driverRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('driver-reg-name').value.trim();
            const phone = document.getElementById('driver-reg-phone').value.trim();
            const license = document.getElementById('driver-reg-license').value.trim();
            const username = document.getElementById('driver-reg-username').value.trim();
            const password = document.getElementById('driver-reg-password').value;
            const confirmPass = document.getElementById('driver-reg-confirm').value;
            
            if (password !== confirmPass) {
                alert('Passwords do not match.');
                return;
            }
            
            // Check if username is already taken
            const taken = driversData.some(d => d.username && d.username.toLowerCase() === username.toLowerCase());
            if (taken) {
                alert('Username is already taken. Please choose another username.');
                return;
            }
            
            // Create a brand new driver profile in driversData
            const newDriver = {
                id: Date.now(),
                name: name,
                status: 'Available',
                phone: phone,
                license: license,
                username: username,
                password: password,
                attendance: 'Present'
            };
            
            driversData.push(newDriver);
            saveData();
            
            // Automatically log the newly registered driver in
            loggedDriverId = newDriver.id;
            sessionStorage.setItem('loggedDriverId', newDriver.id);
            
            // Force admin logout if logged in
            if (isAdminLoggedIn) {
                isAdminLoggedIn = false;
                sessionStorage.setItem('isAdminLoggedIn', 'false');
            }
            
            updateAuthUI();
            driverRegisterForm.reset();
            renderDriverPortal();
            renderDrivers();
            
            showSuccessToast('Registration Successful', `Welcome to the team, ${newDriver.name}!`);
        });
    }
    
    const driverLoginForm = document.getElementById('driver-login-form');
    if (driverLoginForm) {
        driverLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('driver-login-username').value.trim();
            const password = document.getElementById('driver-login-password').value;
            
            const driver = driversData.find(d => d.username && d.username.toLowerCase() === username.toLowerCase() && d.password === password);
            if (driver) {
                loggedDriverId = driver.id;
                sessionStorage.setItem('loggedDriverId', driver.id);
                
                // Automatically mark attendance as Present & availability as Available on login
                driver.attendance = 'Present';
                driver.status = 'Available';
                saveData();
                
                document.getElementById('driver-login-error').style.display = 'none';
                driverLoginForm.reset();
                
                // Force admin logout if logged in
                if (isAdminLoggedIn) {
                    isAdminLoggedIn = false;
                    sessionStorage.setItem('isAdminLoggedIn', 'false');
                }
                
                updateAuthUI();
                renderDriverPortal();
                renderDrivers();
                showSuccessToast('Driver Signed In', `Welcome back, ${driver.name}!`);
            } else {
                const errEl = document.getElementById('driver-login-error');
                if (errEl) errEl.style.display = 'block';
            }
        });
    }
    
    const btnMarkPresent = document.getElementById('btn-mark-present');
    const btnMarkAbsent = document.getElementById('btn-mark-absent');
    const btnMarkAvailable = document.getElementById('btn-mark-available');
    const btnMarkUnavailable = document.getElementById('btn-mark-unavailable');
    const driverSignoutBtn = document.getElementById('driver-signout-btn');
    
    if (btnMarkPresent) {
        btnMarkPresent.addEventListener('click', () => {
            if (!loggedDriverId) return;
            const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
            if (driver) {
                driver.attendance = 'Present';
                saveData();
                renderDriverPortal();
                renderDrivers();
                showSuccessToast('Attendance Updated', 'You have marked your attendance as Present.');
            }
        });
    }
    if (btnMarkAbsent) {
        btnMarkAbsent.addEventListener('click', () => {
            if (!loggedDriverId) return;
            const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
            if (driver) {
                driver.attendance = 'Absent';
                saveData();
                renderDriverPortal();
                renderDrivers();
                showSuccessToast('Attendance Updated', 'You have marked your attendance as Absent.');
            }
        });
    }
    if (btnMarkAvailable) {
        btnMarkAvailable.addEventListener('click', () => {
            if (!loggedDriverId) return;
            const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
            if (driver) {
                driver.status = 'Available';
                saveData();
                renderDriverPortal();
                renderDrivers();
                showSuccessToast('Availability Updated', 'Your availability status has been set to Available.');
            }
        });
    }
    if (btnMarkUnavailable) {
        btnMarkUnavailable.addEventListener('click', () => {
            if (!loggedDriverId) return;
            const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
            if (driver) {
                driver.status = 'Unavailable';
                saveData();
                renderDriverPortal();
                renderDrivers();
                showSuccessToast('Availability Updated', 'Your availability status has been set to Unavailable.');
            }
        });
    }
    if (driverSignoutBtn) {
        driverSignoutBtn.addEventListener('click', () => {
            if (loggedDriverId) {
                const driver = driversData.find(d => String(d.id) === String(loggedDriverId));
                if (driver) {
                    driver.status = 'Unavailable';
                    saveData();
                }
                loggedDriverId = null;
                sessionStorage.removeItem('loggedDriverId');
                updateAuthUI();
                renderDriverPortal();
                renderDrivers();
                showSuccessToast('Signed Out', 'You have signed out of the Driver Portal.');
            }
        });
    }
    
    // Run initial render
    renderDriverPortal();
}

function setupSettingsPortal() {
    const tabProfile = document.getElementById('tab-settings-profile');
    const tabAdmin = document.getElementById('tab-settings-admin');
    const tabBackup = document.getElementById('tab-settings-backup');
    const tabSupabase = document.getElementById('tab-settings-supabase');

    const cardProfile = document.getElementById('settings-profile-card');
    const cardAdmin = document.getElementById('admin-credentials-card');
    const cardBackup = document.getElementById('settings-backup-card');
    const cardSupabase = document.getElementById('settings-supabase-card');

    const tabs = [tabProfile, tabAdmin, tabBackup, tabSupabase];
    const cards = [cardProfile, cardAdmin, cardBackup, cardSupabase];

    tabs.forEach((tab, index) => {
        if (tab) {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                cards.forEach(c => {
                    if (c) c.style.display = 'none';
                });

                tab.classList.add('active');
                if (cards[index]) {
                    cards[index].style.display = 'block';
                }
            });
        }
    });
}

window.viewDocumentFile = function(docId) {
    if (!isAdminLoggedIn) {
        alert('Access Denied. Only Admin is authorized to open or view document files.');
        return;
    }
    const doc = documentsData.find(d => String(d.id) === String(docId));
    if (!doc || !doc.file || doc.file === '#') {
        alert('No file uploaded for this document.');
        return;
    }
    
    // Open a new tab
    const newTab = window.open();
    if (!newTab) {
        alert('Pop-up blocked. Please allow popups to view files.');
        return;
    }
    
    newTab.document.title = doc.name;
    
    if (doc.file.startsWith('data:application/pdf;base64,')) {
        newTab.document.body.innerHTML = `
            <iframe src="${doc.file}" style="width:100%; height:100vh; border:none; margin:0; padding:0;"></iframe>
        `;
        newTab.document.body.style.margin = '0';
        newTab.document.body.style.height = '100vh';
        newTab.document.body.style.overflow = 'hidden';
    } else if (doc.file.startsWith('data:image/')) {
        newTab.document.body.innerHTML = `
            <div style="padding: 12px; background: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <span style="font-weight: 600;">${doc.name}</span>
                <button onclick="window.print()" style="background:#3b82f6; color:white; border:none; padding:6px 16px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px; transition: background 0.2s;">Print / Save Image</button>
            </div>
            <div style="display:flex; justify-content:center; align-items:center; min-height:calc(100vh - 60px); background:#f8fafc; padding:20px; box-sizing:border-box;">
                <img src="${doc.file}" style="max-width:100%; max-height:80vh; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); border-radius:8px; border:1px solid #e2e8f0;">
            </div>`;
        newTab.document.body.style.margin = '0';
    } else {
        newTab.location.href = doc.file;
    }
};

// ==========================================
// 8. Data Synchronization & Backup Functions
// ==========================================

function exportFleetData() {
    if (!checkAdminAuth()) return;

    try {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                trucksData: JSON.parse(localStorage.getItem('trucksData')) || defaultTrucks,
                bookingsData: JSON.parse(localStorage.getItem('bookingsData')) || defaultBookings,
                driversData: JSON.parse(localStorage.getItem('driversData')) || defaultDrivers,
                maintenanceData: JSON.parse(localStorage.getItem('maintenanceData')) || defaultMaintenance,
                fuelLogsData: JSON.parse(localStorage.getItem('fuelLogsData')) || defaultFuelLogs,
                documentsData: JSON.parse(localStorage.getItem('documentsData')) || defaultDocuments,
                trailersData: JSON.parse(localStorage.getItem('trailersData')) || defaultTrailers,
                profileCompanyName: localStorage.getItem('profileCompanyName') || "Imran Fleet Management",
                profilePhone: localStorage.getItem('profilePhone') || "92832755",
                profileEmail: localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com",
                profileLocation: localStorage.getItem('profileLocation') || "Salalah/Oman",
                web3formsKey: localStorage.getItem('web3formsKey') || "",
                adminUsername: localStorage.getItem('adminUsername') || "imranakhtar9283",
                adminPassword: localStorage.getItem('adminPassword') || "imran9283"
            }
        };

        const jsonString = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `imran_aktar_transports_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccessToast('Export Successful', 'Fleet database and profile settings exported successfully.');
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export data: ' + error.message);
    }
}

function importFleetData() {
    if (!checkAdminAuth()) return;

    const fileInput = document.getElementById('import-backup-file');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Please select a valid JSON backup file first.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            
            if (!parsed || typeof parsed !== 'object' || !parsed.data) {
                throw new Error('Invalid backup file format. Missing data container.');
            }
            
            const d = parsed.data;
            
            if (d.trucksData && !Array.isArray(d.trucksData)) throw new Error('Invalid trucks data in backup.');
            if (d.bookingsData && !Array.isArray(d.bookingsData)) throw new Error('Invalid bookings data in backup.');
            if (d.driversData && !Array.isArray(d.driversData)) throw new Error('Invalid drivers data in backup.');
            if (d.maintenanceData && !Array.isArray(d.maintenanceData)) throw new Error('Invalid maintenance data in backup.');
            if (d.fuelLogsData && !Array.isArray(d.fuelLogsData)) throw new Error('Invalid fuel logs data in backup.');
            if (d.documentsData && !Array.isArray(d.documentsData)) throw new Error('Invalid documents data in backup.');
            if (d.trailersData && !Array.isArray(d.trailersData)) throw new Error('Invalid trailers data in backup.');

            showConfirm('Import Backup', 'Warning: This will overwrite all your current fleet data, settings, and credentials. Are you sure you want to proceed?')
                .then((confirmed) => {
                    if (!confirmed) return;

                    // Overwrite storage and local variables
                    if (d.trucksData) {
                        trucksData = d.trucksData;
                        localStorage.setItem('trucksData', JSON.stringify(trucksData));
                    }
                    if (d.bookingsData) {
                        bookingsData = d.bookingsData;
                        localStorage.setItem('bookingsData', JSON.stringify(bookingsData));
                    }
                    if (d.driversData) {
                        driversData = d.driversData;
                        localStorage.setItem('driversData', JSON.stringify(driversData));
                    }
                    if (d.maintenanceData) {
                        maintenanceData = d.maintenanceData;
                        localStorage.setItem('maintenanceData', JSON.stringify(maintenanceData));
                    }
                    if (d.fuelLogsData) {
                        fuelLogsData = d.fuelLogsData;
                        localStorage.setItem('fuelLogsData', JSON.stringify(fuelLogsData));
                    }
                    if (d.documentsData) {
                        documentsData = d.documentsData;
                        localStorage.setItem('documentsData', JSON.stringify(documentsData));
                    }
                    if (d.trailersData) {
                        trailersData = d.trailersData;
                        localStorage.setItem('trailersData', JSON.stringify(trailersData));
                    }

                    if (d.profileCompanyName !== undefined) localStorage.setItem('profileCompanyName', d.profileCompanyName);
                    if (d.profilePhone !== undefined) localStorage.setItem('profilePhone', d.profilePhone);
                    if (d.profileEmail !== undefined) localStorage.setItem('profileEmail', d.profileEmail);
                    if (d.profileLocation !== undefined) localStorage.setItem('profileLocation', d.profileLocation);
                    if (d.web3formsKey !== undefined) localStorage.setItem('web3formsKey', d.web3formsKey);
                    if (d.adminUsername !== undefined) localStorage.setItem('adminUsername', d.adminUsername);
                    if (d.adminPassword !== undefined) localStorage.setItem('adminPassword', d.adminPassword);

                    // Update UI input values
                    const companyInput = document.getElementById('company-name-input');
                    const phoneInput = document.getElementById('phone-input');
                    const emailInput = document.getElementById('email-input');
                    const locationInput = document.getElementById('location-input');
                    const web3formsKeyInput = document.getElementById('web3forms-key-input');
                    
                    if (companyInput) companyInput.value = localStorage.getItem('profileCompanyName') || "";
                    if (phoneInput) phoneInput.value = localStorage.getItem('profilePhone') || "";
                    if (emailInput) emailInput.value = localStorage.getItem('profileEmail') || "";
                    if (locationInput) locationInput.value = localStorage.getItem('profileLocation') || "";
                    if (web3formsKeyInput) web3formsKeyInput.value = localStorage.getItem('web3formsKey') || "";
                    
                    syncSettingsDOM();

                    // Re-render layout
                    updateDashboardStats();
                    renderTrucks();
                    renderTrucksTable();
                    renderStatusManager();
                    renderBookings();
                    renderDrivers();
                    renderMaintenance();
                    renderFuelLogs();
                    renderDocuments();
                    renderTrailers();
                    populateModalDropdowns();
                    updateAuthUI();

                    fileInput.value = '';
                    const importFilenameDisplay = document.getElementById('import-filename');
                    if (importFilenameDisplay) {
                        importFilenameDisplay.textContent = 'No file selected';
                        importFilenameDisplay.style.color = 'var(--text-muted)';
                    }

                    showSuccessToast('Backup Imported', 'The backup file was loaded and current data has been updated.');
                });

        } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Real-time Tab Synchronization Listener (Storage Event)
window.addEventListener('storage', (e) => {
    const syncKeys = [
        'trucksData', 'bookingsData', 'driversData', 'maintenanceData', 
        'fuelLogsData', 'documentsData', 'profileCompanyName', 
        'profilePhone', 'profileEmail', 'profileLocation', 
        'web3formsKey', 'adminUsername', 'adminPassword'
    ];
    
    if (syncKeys.includes(e.key)) {
        if (e.key === 'trucksData') {
            try { trucksData = e.newValue ? (JSON.parse(e.newValue) || []) : []; } catch (err) { console.error(err); }
        } else if (e.key === 'bookingsData') {
            try { bookingsData = e.newValue ? (JSON.parse(e.newValue) || []) : []; } catch (err) { console.error(err); }
        } else if (e.key === 'driversData') {
            try { driversData = e.newValue ? (JSON.parse(e.newValue) || []) : []; } catch (err) { console.error(err); }
        } else if (e.key === 'maintenanceData') {
            try { maintenanceData = e.newValue ? (JSON.parse(e.newValue) || []) : []; } catch (err) { console.error(err); }
        } else if (e.key === 'fuelLogsData') {
            try { fuelLogsData = e.newValue ? (JSON.parse(e.newValue) || []) : []; } catch (err) { console.error(err); }
        } else if (e.key === 'documentsData') {
            try { documentsData = e.newValue ? (JSON.parse(e.newValue) || []) : []; } catch (err) { console.error(err); }
        }
        
        if (['profileCompanyName', 'profilePhone', 'profileEmail', 'profileLocation', 'web3formsKey'].includes(e.key)) {
            const companyInput = document.getElementById('company-name-input');
            const phoneInput = document.getElementById('phone-input');
            const emailInput = document.getElementById('email-input');
            const locationInput = document.getElementById('location-input');
            const web3formsKeyInput = document.getElementById('web3forms-key-input');
            
            if (companyInput && e.key === 'profileCompanyName') companyInput.value = e.newValue || "";
            if (phoneInput && e.key === 'profilePhone') phoneInput.value = e.newValue || "";
            if (emailInput && e.key === 'profileEmail') emailInput.value = e.newValue || "";
            if (locationInput && e.key === 'profileLocation') locationInput.value = e.newValue || "";
            if (web3formsKeyInput && e.key === 'web3formsKey') web3formsKeyInput.value = e.newValue || "";
            
            syncSettingsDOM();
        }

        updateDashboardStats();
        renderTrucks();
        renderTrucksTable();
        renderStatusManager();
        renderBookings();
        renderDrivers();
        renderMaintenance();
        renderFuelLogs();
        renderDocuments();
        populateModalDropdowns();
        updateAuthUI();
    }
});

// ==========================================
// 9. Supabase Cloud Sync Operations
// ==========================================

function initSupabase() {
    const statusBadge = document.getElementById('supabase-status-badge');
    const errorMsgEl = document.getElementById('supabase-error-msg');
    
    if (errorMsgEl) errorMsgEl.style.display = 'none';
    
    const syncDisabled = localStorage.getItem('supabaseSyncDisabled') === 'true';
    if (syncDisabled) {
        if (statusBadge) {
            statusBadge.innerText = 'Disconnected';
            statusBadge.style.backgroundColor = 'rgba(100, 116, 139, 0.08)';
            statusBadge.style.color = '#64748b';
            statusBadge.style.borderColor = 'rgba(100, 116, 139, 0.15)';
        }
        if (errorMsgEl) errorMsgEl.style.display = 'none';
        supabaseClient = null;
        return;
    }
    
    let url = localStorage.getItem('supabaseUrl') || DEFAULT_SUPABASE_URL;
    let key = localStorage.getItem('supabaseKey') || DEFAULT_SUPABASE_KEY;
    
    if (url) {
        url = url.trim().replace(/\/$/, '');
        if (url.endsWith('/rest/v1')) {
            url = url.substring(0, url.length - 8);
        }
    }
    
    if (url && key) {
        try {
            if (statusBadge) {
                statusBadge.innerText = 'Connecting...';
                statusBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
                statusBadge.style.color = '#f59e0b';
                statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.15)';
            }
            
            // supabasejs is imported from CDN
            const sbClient = (typeof supabasejs !== 'undefined') ? supabasejs : (typeof window.supabase !== 'undefined' ? window.supabase : null);
            if (!sbClient) {
                throw new Error('Supabase Client SDK not loaded. Check internet connection or CDN link.');
            }
            
            supabaseClient = sbClient.createClient(url, key);
            
            // Test connection by fetching key list
            supabaseClient.from('fleet_data').select('key').limit(1)
                .then(({ data, error }) => {
                    if (error) throw error;
                    
                    if (statusBadge) {
                        statusBadge.innerText = 'Connected';
                        statusBadge.style.backgroundColor = '#ecfdf5';
                        statusBadge.style.color = '#059669';
                        statusBadge.style.borderColor = 'rgba(5, 150, 105, 0.15)';
                    }
                    if (errorMsgEl) errorMsgEl.style.display = 'none';
                    
                    // Load all data from Supabase
                    loadDataFromSupabase().then(() => {
                        // Subscribe to realtime database changes
                        subscribeToSupabaseRealtime();
                    });
                })
                .catch(err => {
                    console.error('Supabase connection failed:', err);
                    if (statusBadge) {
                        statusBadge.innerText = 'Connection Error';
                        statusBadge.style.backgroundColor = '#fef2f2';
                        statusBadge.style.color = '#dc2626';
                        statusBadge.style.borderColor = 'rgba(220, 38, 38, 0.15)';
                    }
                    if (errorMsgEl) {
                        errorMsgEl.innerText = `Error: ${err.message || JSON.stringify(err)}`;
                        errorMsgEl.style.display = 'block';
                    }
                });
        } catch (e) {
            console.error('Supabase initialization failed:', e);
            if (statusBadge) {
                statusBadge.innerText = 'Connection Error';
                statusBadge.style.backgroundColor = '#fef2f2';
                statusBadge.style.color = '#dc2626';
                statusBadge.style.borderColor = 'rgba(220, 38, 38, 0.15)';
            }
            if (errorMsgEl) {
                errorMsgEl.innerText = `Error: ${e.message || JSON.stringify(e)}`;
                errorMsgEl.style.display = 'block';
            }
        }
    } else {
        if (statusBadge) {
            statusBadge.innerText = 'Disconnected';
            statusBadge.style.backgroundColor = 'rgba(100, 116, 139, 0.08)';
            statusBadge.style.color = '#64748b';
            statusBadge.style.borderColor = 'rgba(100, 116, 139, 0.15)';
        }
        if (errorMsgEl) errorMsgEl.style.display = 'none';
    }
}

async function loadDataFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('fleet_data')
            .select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
            data.forEach(row => {
                if (row.key === 'trucks') trucksData = row.value || [];
                else if (row.key === 'bookings') bookingsData = row.value || [];
                else if (row.key === 'drivers') driversData = row.value || [];
                else if (row.key === 'maintenance') maintenanceData = row.value || [];
                else if (row.key === 'fuel_logs') fuelLogsData = row.value || [];
                else if (row.key === 'documents') documentsData = row.value || [];
                else if (row.key === 'trailers') trailersData = row.value || [];
                else if (row.key === 'settings') {
                    const s = row.value || {};
                    if (s.profileCompanyName !== undefined) localStorage.setItem('profileCompanyName', s.profileCompanyName);
                    if (s.profilePhone !== undefined) localStorage.setItem('profilePhone', s.profilePhone);
                    if (s.profileEmail !== undefined) localStorage.setItem('profileEmail', s.profileEmail);
                    if (s.profileLocation !== undefined) localStorage.setItem('profileLocation', s.profileLocation);
                    if (s.web3formsKey !== undefined) localStorage.setItem('web3formsKey', s.web3formsKey);
                    if (s.adminUsername !== undefined) localStorage.setItem('adminUsername', s.adminUsername);
                    if (s.adminPassword !== undefined) localStorage.setItem('adminPassword', s.adminPassword);
                }
            });

            // Hydrate values in current view settings inputs
            const companyInput = document.getElementById('company-name-input');
            const phoneInput = document.getElementById('phone-input');
            const emailInput = document.getElementById('email-input');
            const locationInput = document.getElementById('location-input');
            const web3formsKeyInput = document.getElementById('web3forms-key-input');
            
            if (companyInput) companyInput.value = localStorage.getItem('profileCompanyName') || "";
            if (phoneInput) phoneInput.value = localStorage.getItem('profilePhone') || "";
            if (emailInput) emailInput.value = localStorage.getItem('profileEmail') || "";
            if (locationInput) locationInput.value = localStorage.getItem('profileLocation') || "";
            if (web3formsKeyInput) web3formsKeyInput.value = localStorage.getItem('web3formsKey') || "";
            
            syncSettingsDOM();

            // Save copies locally as a fallback backup
            localStorage.setItem('trucksData', JSON.stringify(trucksData));
            localStorage.setItem('bookingsData', JSON.stringify(bookingsData));
            localStorage.setItem('driversData', JSON.stringify(driversData));
            localStorage.setItem('maintenanceData', JSON.stringify(maintenanceData));
            localStorage.setItem('fuelLogsData', JSON.stringify(fuelLogsData));
            localStorage.setItem('documentsData', JSON.stringify(documentsData));
            localStorage.setItem('trailersData', JSON.stringify(trailersData));

            // Force full UI redraw
            updateDashboardStats();
            renderTrucks();
            renderTrucksTable();
            renderStatusManager();
            renderBookings();
            renderDrivers();
            renderMaintenance();
            renderFuelLogs();
            renderDocuments();
            renderTrailers();
            populateModalDropdowns();
            updateAuthUI();
        }
    } catch (err) {
        console.error('Failed to load data from Supabase:', err);
    }
}

async function syncToSupabase() {
    if (!supabaseClient) return;
    try {
        const rows = [
            { key: 'trucks', value: trucksData },
            { key: 'bookings', value: bookingsData },
            { key: 'drivers', value: driversData },
            { key: 'maintenance', value: maintenanceData },
            { key: 'fuel_logs', value: fuelLogsData },
            { key: 'documents', value: documentsData },
            { key: 'trailers', value: trailersData },
            {
                key: 'settings',
                value: {
                    profileCompanyName: localStorage.getItem('profileCompanyName') || "Imran Fleet Management",
                    profilePhone: localStorage.getItem('profilePhone') || "92832755",
                    profileEmail: localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com",
                    profileLocation: localStorage.getItem('profileLocation') || "Salalah/Oman",
                    web3formsKey: localStorage.getItem('web3formsKey') || "",
                    adminUsername: localStorage.getItem('adminUsername') || "imranakhtar9283",
                    adminPassword: localStorage.getItem('adminPassword') || "imran9283"
                }
            }
        ];

        // Upsert key datasets in background
        const { error } = await supabaseClient
            .from('fleet_data')
            .upsert(rows);
        
        if (error) throw error;
    } catch (err) {
        console.error('Failed to sync data to Supabase:', err);
    }
}

function subscribeToSupabaseRealtime() {
    if (!supabaseClient) return;
    
    supabaseClient
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'fleet_data'
            },
            (payload) => {
                const row = payload.new;
                if (!row) return;

                if (row.key === 'trucks') trucksData = row.value || [];
                else if (row.key === 'bookings') bookingsData = row.value || [];
                else if (row.key === 'drivers') driversData = row.value || [];
                else if (row.key === 'maintenance') maintenanceData = row.value || [];
                else if (row.key === 'fuel_logs') fuelLogsData = row.value || [];
                else if (row.key === 'documents') documentsData = row.value || [];
                else if (row.key === 'trailers') trailersData = row.value || [];
                else if (row.key === 'settings') {
                    const s = row.value || {};
                    if (s.profileCompanyName !== undefined) localStorage.setItem('profileCompanyName', s.profileCompanyName);
                    if (s.profilePhone !== undefined) localStorage.setItem('profilePhone', s.profilePhone);
                    if (s.profileEmail !== undefined) localStorage.setItem('profileEmail', s.profileEmail);
                    if (s.profileLocation !== undefined) localStorage.setItem('profileLocation', s.profileLocation);
                    if (s.web3formsKey !== undefined) localStorage.setItem('web3formsKey', s.web3formsKey);
                    if (s.adminUsername !== undefined) localStorage.setItem('adminUsername', s.adminUsername);
                    if (s.adminPassword !== undefined) localStorage.setItem('adminPassword', s.adminPassword);
                }

                // Update settings fields
                const companyInput = document.getElementById('company-name-input');
                const phoneInput = document.getElementById('phone-input');
                const emailInput = document.getElementById('email-input');
                const locationInput = document.getElementById('location-input');
                const web3formsKeyInput = document.getElementById('web3forms-key-input');
                
                if (companyInput) companyInput.value = localStorage.getItem('profileCompanyName') || "";
                if (phoneInput) phoneInput.value = localStorage.getItem('profilePhone') || "";
                if (emailInput) emailInput.value = localStorage.getItem('profileEmail') || "";
                if (locationInput) locationInput.value = localStorage.getItem('profileLocation') || "";
                if (web3formsKeyInput) web3formsKeyInput.value = localStorage.getItem('web3formsKey') || "";
                
                syncSettingsDOM();

                // Save fallback locally
                localStorage.setItem('trucksData', JSON.stringify(trucksData));
                localStorage.setItem('bookingsData', JSON.stringify(bookingsData));
                localStorage.setItem('driversData', JSON.stringify(driversData));
                localStorage.setItem('maintenanceData', JSON.stringify(maintenanceData));
                localStorage.setItem('fuelLogsData', JSON.stringify(fuelLogsData));
                localStorage.setItem('documentsData', JSON.stringify(documentsData));
                localStorage.setItem('trailersData', JSON.stringify(trailersData));

                // Force layout refresh
                updateDashboardStats();
                renderTrucks();
                renderTrucksTable();
                renderStatusManager();
                renderBookings();
                renderDrivers();
                renderMaintenance();
                renderFuelLogs();
                renderDocuments();
                renderTrailers();
                populateModalDropdowns();
                updateAuthUI();
            }
        )
        .subscribe();
}

// ==========================================
// 10. Trailer View Rendering & Helper Functions
// ==========================================

function renderTrailers() {
    const tbody = document.getElementById('trailers-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const filtered = trailersData.filter(t => {
        const matchesSearch = t.number.toLowerCase().includes(trailersSearchFilter.toLowerCase()) || 
                             t.type.toLowerCase().includes(trailersSearchFilter.toLowerCase()) ||
                             (t.mulkiyaExpiry && t.mulkiyaExpiry.toLowerCase().includes(trailersSearchFilter.toLowerCase())) ||
                             (t.vocExpiry && t.vocExpiry.toLowerCase().includes(trailersSearchFilter.toLowerCase())) ||
                             t.assignedTruck.toLowerCase().includes(trailersSearchFilter.toLowerCase()) ||
                             t.status.toLowerCase().includes(trailersSearchFilter.toLowerCase());
        const matchesStatus = trailersStatusFilter === 'all' || t.status === trailersStatusFilter;
        return matchesSearch && matchesStatus;
    });
    
    filtered.forEach(trailer => {
        const row = document.createElement('tr');
        
        let statusClass = 'status-available';
        let statusText = 'Available';
        if (trailer.status === 'unavailable') {
            statusClass = 'status-unavailable';
            statusText = 'Not Available';
        } else if (trailer.status === 'maintenance') {
            statusClass = 'status-maintenance';
            statusText = 'Maintenance';
        }
        
        let actionsHtml = '';
        if (isAdminLoggedIn) {
            actionsHtml = `
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action action-edit" onclick="editTrailer(${trailer.id})" title="Edit Trailer">
                            ${editSvg}
                        </button>
                        <button class="btn-table-action action-delete" onclick="deleteTrailer(${trailer.id})" title="Delete Trailer">
                            ${deleteSvg}
                        </button>
                    </div>
                </td>
            `;
        }
        
        row.innerHTML = `
            <td style="font-weight:700; color:var(--primary-green-bright);">${trailer.number}</td>
            <td>${trailer.type}</td>
            <td><span class="${checkMulkiyaExpiry(trailer.mulkiyaExpiry).textClass}">${formatDate(trailer.mulkiyaExpiry)}</span></td>
            <td><span class="${checkMulkiyaExpiry(trailer.vocExpiry).textClass}">${formatDate(trailer.vocExpiry)}</span></td>
            <td style="font-weight:600; color:var(--text-primary);">${trailer.assignedTruck}</td>
            <td><span class="status-badge ${statusClass}" style="position:relative; top:0; right:0;">${statusText}</span></td>
            ${actionsHtml}
        `;
        tbody.appendChild(row);
    });
}

window.editTrailer = function(id) {
    if (!checkAdminAuth()) return;
    const trailer = trailersData.find(t => t.id === id);
    if (trailer) {
        editingTrailerId = id;
        document.getElementById('add-trailer-title').innerText = 'Edit Trailer Profile';
        document.getElementById('trailer-submit-btn').innerText = 'Save Changes';
        
        document.getElementById('trailer-plate').value = trailer.number;
        document.getElementById('trailer-type').value = trailer.type;
        document.getElementById('trailer-mulkiya-expiry').value = trailer.mulkiyaExpiry || '';
        document.getElementById('trailer-voc-expiry').value = trailer.vocExpiry || '';
        
        populateModalDropdowns();
        document.getElementById('trailer-truck-select').value = trailer.assignedTruck;
        document.getElementById('trailer-status').value = trailer.status;
        
        const addTrailerModal = document.getElementById('add-trailer-modal');
        if (addTrailerModal) addTrailerModal.classList.add('active');
    }
};

window.deleteTrailer = async function(id) {
    if (!checkAdminAuth()) return;
    const confirmed = await showConfirm('Delete Trailer', 'Are you sure you want to delete this trailer from the registry?');
    if (confirmed) {
        trailersData = trailersData.filter(t => t.id !== id);
        saveData();
        renderTrailers();
        showSuccessToast('Trailer Deleted', 'Trailer successfully removed from register.');
    }
};

// ==========================================
// 9. Persistent Local File Auto-Backup
// ==========================================

const DB_NAME = 'FleetBackupDB';
const STORE_NAME = 'BackupHandles';
const KEY_NAME = 'backupFileHandle';
let persistentFileHandle = null;

function openBackupDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function saveFileHandle(handle) {
    try {
        const db = await openBackupDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(handle, KEY_NAME);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to save file handle to IndexedDB:', err);
    }
}

async function getFileHandle() {
    try {
        const db = await openBackupDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(KEY_NAME);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to get file handle from IndexedDB:', err);
        return null;
    }
}

async function clearFileHandle() {
    try {
        const db = await openBackupDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(KEY_NAME);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to clear file handle in IndexedDB:', err);
    }
}

window.initPersistentBackup = async function() {
    try {
        persistentFileHandle = await getFileHandle();
        updatePersistentBackupUI();
    } catch (err) {
        console.error('Failed to initialize persistent backup:', err);
    }
};

window.updatePersistentBackupUI = async function() {
    const cardEl = document.getElementById('persistent-backup-status-container');
    if (!cardEl) return;

    const isFileSystemAccessSupported = typeof window.showSaveFilePicker === 'function';
    if (!isFileSystemAccessSupported) {
        cardEl.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.18); border-radius: var(--border-radius); padding: 12px 16px; font-size: 13px; color: var(--accent-red); line-height: 1.5;">
                <strong>Browser Not Supported:</strong> Your browser does not support the File System Access API (needed to automatically save data to a local file in real-time). Please use Chrome, Edge, or Opera on desktop to use this feature. In the meantime, you can still export and import backups manually above.
            </div>
        `;
        return;
    }

    if (!persistentFileHandle) {
        cardEl.innerHTML = `
            <div class="backup-status-badge disconnected">Not Configured</div>
            <p class="text-muted" style="font-size: 13px; margin: 8px 0 16px 0;">
                No local backup file is currently linked. Choose or create a local JSON file to enable real-time background auto-saving.
            </p>
            <button type="button" id="btn-setup-persistent-backup" class="btn btn-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; margin-right: 8px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Choose Target Backup File
            </button>
        `;
        const setupBtn = document.getElementById('btn-setup-persistent-backup');
        if (setupBtn) {
            setupBtn.addEventListener('click', setupPersistentBackup);
        }
        return;
    }

    let permission = 'prompt';
    try {
        permission = await persistentFileHandle.queryPermission({ mode: 'readwrite' });
    } catch (err) {
        console.error('Error querying permission:', err);
    }
    
    const filename = persistentFileHandle.name;
    const lastSync = localStorage.getItem('persistentBackupLastSync') || 'Never';

    if (permission === 'granted') {
        cardEl.innerHTML = `
            <div class="backup-status-badge active">🟢 Auto-Sync Active</div>
            <div class="backup-info-row" style="margin-top: 12px; font-size: 14px;">
                <div><strong>Linked File:</strong> <code style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">${filename}</code></div>
                <div style="margin-top: 4px;"><strong>Last Written:</strong> <span class="text-muted">${lastSync}</span></div>
            </div>
            <div style="display: flex; gap: 12px; margin-top: 16px;">
                <button type="button" id="btn-sync-persistent-now" class="btn btn-green btn-sm">Sync Now</button>
                <button type="button" id="btn-disconnect-persistent" class="btn btn-outline btn-red btn-sm">Disconnect</button>
            </div>
        `;
        
        document.getElementById('btn-sync-persistent-now').addEventListener('click', triggerPersistentSync);
        document.getElementById('btn-disconnect-persistent').addEventListener('click', disconnectPersistentBackup);
    } else {
        cardEl.innerHTML = `
            <div class="backup-status-badge paused">🔒 Requires Authorization</div>
            <p class="text-muted" style="font-size: 13px; margin: 8px 0 16px 0;">
                The link to <code>${filename}</code> is suspended due to browser security. Re-authorize to resume automatic background saving.
            </p>
            <div style="display: flex; gap: 12px;">
                <button type="button" id="btn-authorize-persistent" class="btn btn-green">Re-authorize Backup</button>
                <button type="button" id="btn-disconnect-persistent" class="btn btn-outline btn-red">Disconnect</button>
            </div>
        `;
        
        document.getElementById('btn-authorize-persistent').addEventListener('click', authorizePersistentBackup);
        document.getElementById('btn-disconnect-persistent').addEventListener('click', disconnectPersistentBackup);
    }
};

async function setupPersistentBackup() {
    if (!checkAdminAuth()) return;
    try {
        const options = {
            suggestedName: 'imran_transports_fleet_backup.json',
            types: [{
                description: 'JSON Backup Files',
                accept: {
                    'application/json': ['.json'],
                },
            }],
        };
        const handle = await window.showSaveFilePicker(options);
        persistentFileHandle = handle;
        await saveFileHandle(handle);
        
        const success = await performPersistentSync();
        if (success) {
            showSuccessToast('Auto-Backup Linked', `Successfully linked backup to ${handle.name}`);
        } else {
            alert('Could not write to the chosen backup file. Please try again.');
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('Failed to set up persistent backup file:', err);
            alert('Failed to configure backup file: ' + err.message);
        }
    }
}

async function authorizePersistentBackup() {
    if (!persistentFileHandle) return;
    try {
        const permission = await persistentFileHandle.requestPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
            const success = await performPersistentSync();
            if (success) {
                showSuccessToast('Access Granted', 'Backup auto-sync has resumed.');
            } else {
                alert('Failed to write initial sync to backup file.');
            }
        } else {
            alert('Write access was not authorized.');
        }
    } catch (err) {
        console.error('Authorization failed:', err);
        alert('Authorization failed: ' + err.message);
    }
}

async function disconnectPersistentBackup() {
    const confirmed = await showConfirm('Disconnect Backup File', 'Are you sure you want to stop backing up to this local file? Background auto-saving will be disabled.');
    if (confirmed) {
        persistentFileHandle = null;
        await clearFileHandle();
        localStorage.removeItem('persistentBackupLastSync');
        updatePersistentBackupUI();
        showSuccessToast('Backup Disconnected', 'Local file backup has been disabled.');
    }
}

async function triggerPersistentSync() {
    if (!checkAdminAuth()) return;
    const success = await performPersistentSync();
    if (success) {
        showSuccessToast('Sync Successful', 'Data has been successfully written to the backup file.');
    } else {
        alert('Could not write to the backup file. Try re-authorizing or linking the file again.');
    }
}

window.performPersistentSync = async function() {
    if (!persistentFileHandle) return false;
    
    // Check permission first
    try {
        const permission = await persistentFileHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
            updatePersistentBackupUI();
            return false;
        }
    } catch (err) {
        console.error('Error checking permission for sync:', err);
        return false;
    }

    try {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                trucksData: JSON.parse(localStorage.getItem('trucksData')) || defaultTrucks,
                bookingsData: JSON.parse(localStorage.getItem('bookingsData')) || defaultBookings,
                driversData: JSON.parse(localStorage.getItem('driversData')) || defaultDrivers,
                maintenanceData: JSON.parse(localStorage.getItem('maintenanceData')) || defaultMaintenance,
                fuelLogsData: JSON.parse(localStorage.getItem('fuelLogsData')) || defaultFuelLogs,
                documentsData: JSON.parse(localStorage.getItem('documentsData')) || defaultDocuments,
                trailersData: JSON.parse(localStorage.getItem('trailersData')) || defaultTrailers,
                profileCompanyName: localStorage.getItem('profileCompanyName') || "Imran Fleet Management",
                profilePhone: localStorage.getItem('profilePhone') || "92832755",
                profileEmail: localStorage.getItem('profileEmail') || "imranaktar.transport@gmail.com",
                profileLocation: localStorage.getItem('profileLocation') || "Salalah/Oman",
                web3formsKey: localStorage.getItem('web3formsKey') || "",
                adminUsername: localStorage.getItem('adminUsername') || "imranakhtar9283",
                adminPassword: localStorage.getItem('adminPassword') || "imran9283"
            }
        };

        const jsonString = JSON.stringify(backup, null, 2);
        const writable = await persistentFileHandle.createWritable();
        await writable.write(jsonString);
        await writable.close();
        
        const nowStr = formatDate(new Date());
        localStorage.setItem('persistentBackupLastSync', nowStr);
        updatePersistentBackupUI();
        return true;
    } catch (err) {
        console.error('Failed to sync to persistent file:', err);
        updatePersistentBackupUI();
        return false;
    }
};

