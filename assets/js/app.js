/**
 * Ramadan App Logic
 * Generate By MeGaTiK System
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // Must be first!
    initHeader();
    initTabs();
    initPageContent();
    checkMikroTikVars();
    updateNavbarAuth();
    initMobileKeyboardFix();
});

// Auth State Management
function setAuthState(active) {
    if (active) localStorage.setItem('hs_auth', 'true');
    else localStorage.removeItem('hs_auth');
    updateNavbarAuth();
}

function updateNavbarAuth() {
    const isLoggedIn = localStorage.getItem('hs_auth') === 'true';
    const loginLinks = document.querySelectorAll('a[href="login.html"]');

    loginLinks.forEach(link => {
        if (isLoggedIn) {
            link.href = 'status.html';
            const span = link.querySelector('span');
            if (span) span.innerText = 'حسابي';

            // Swap Icon to User
            const svg = link.querySelector('svg');
            if (svg) {
                svg.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
            }
        }
    });
}

function initTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        const configDefault = (typeof HotspotConfig !== 'undefined' && HotspotConfig.defaultTheme) ? HotspotConfig.defaultTheme : 'dark';
        const shouldUseLight = (savedTheme === 'light') || (!savedTheme && configDefault === 'light');

        if (shouldUseLight) {
            document.documentElement.setAttribute('data-theme', 'light');
            updateThemeIcon(true);
        } else {
            document.documentElement.removeAttribute('data-theme');
            updateThemeIcon(false);
        }
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                if (e.newValue === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                    updateThemeIcon(true);
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    updateThemeIcon(false);
                }
            }
        });
    } catch (e) {
        console.error("Theme init error:", e);
    }
}

// Run immediately if config is available, otherwise wait for load
if (typeof HotspotConfig !== 'undefined') {
    initTheme();
} else {
    // If loaded before config, wait (though typical order is config -> app)
    document.addEventListener('DOMContentLoaded', initTheme);
}

function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    if (isLight) {
        // Switch to Dark
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(false);
    } else {
        // Switch to Light
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isLight) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Icon logic: Show the icon for the mode we WANT to switch TO.
    if (isLight) {
        // Current is Light. Show Moon (to switch to Dark).
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        btn.setAttribute('title', 'Switch to Dark Mode');
    } else {
        // Current is Dark. Show Sun (to switch to Light).
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        btn.setAttribute('title', 'Switch to Light Mode');
    }
}

// Dynamic Header Injection (Theme Toggle Only)
function initHeader() {
    const existingHeader = document.querySelector('.top-header');
    if (existingHeader) return;

    const header = document.createElement('header');
    header.className = 'top-header';

    // Brand Name (Arabic Only)
    const brandName = HotspotConfig.networkName;

    header.innerHTML = `
        <div class="brand-name">
            <img src="assets/img/favicon.png" alt="Logo" class="header-logo">
            ${brandName || 'MEGA NET'}
        </div>
        <div class="header-actions">
            <button id="theme-toggle" class="icon-btn" aria-label="Toggle Theme">
                <!-- Icon injected by updateThemeIcon -->
            </button>
        </div>
    `;

    document.body.prepend(header);

    // Event Listener
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
        // Force update icon now that button exists
        const isLight = document.body.getAttribute('data-theme') === 'light';
        updateThemeIcon(isLight);
    }
}

// Tab Management (Login only)
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const form = document.getElementById('login-form');
    const userLabel = document.getElementById('user-label');
    const passGroup = document.getElementById('pass-group');

    if (!tabs.length) return;

    // Helper to switch modes
    const setMode = (mode) => {
        // Toggle Active Tab State
        tabs.forEach(t => {
            if (t.dataset.target === mode) t.classList.add('active');
            else t.classList.remove('active');
        });

        const userInput = document.getElementById('username');
        const passInput = document.getElementById('password');

        if (mode === 'card-tab') {
            // CARD MODE
            if (passGroup) passGroup.style.display = 'none'; // Hide password field
            if (userLabel) userLabel.innerText = 'رقم الكارت'; // Update label
            if (userInput) {
                userInput.placeholder = ' ';
            }
        } else {
            // USER MODE
            if (passGroup) passGroup.style.display = 'block'; // Show password field
            if (userLabel) userLabel.innerText = 'اسم المستخدم'; // Update label
            if (passInput) passInput.value = ''; // Clear password field potentially
            if (userInput) {
                userInput.placeholder = ' ';
            }
        }
    };

    // Initialize Default State
    // Check config or default to 'user'
    let currentMode = (typeof HotspotConfig !== 'undefined' && HotspotConfig.defaultAuthMode === 'card') ? 'card-tab' : 'user-tab';
    setMode(currentMode);

    // Tab Click Listeners
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.dataset.target;
            currentMode = target;
            setMode(target);
        });
    });

    // Form Submission Logic
    if (form) {
        form.addEventListener('submit', (e) => {
            const userInput = document.getElementById('username');
            const passInput = document.getElementById('password');

            if (currentMode === 'card-tab') {
                // Determine if card code should be copied to password or left empty
                const useCardAsPass = (typeof HotspotConfig !== 'undefined' && HotspotConfig.userEqualPassword !== undefined)
                    ? HotspotConfig.userEqualPassword
                    : true;

                if (userInput && passInput) {
                    passInput.value = useCardAsPass ? userInput.value : '';
                }
            }
            // In User Mode: Standard submit
        });
    }
}

// Content Population (Arabic Only)
function initPageContent() {
    const packagesContainer = document.getElementById('packages-container');
    const salesContainer = document.getElementById('sales-container');
    const contactContainer = document.getElementById('contact-container');

    // PACKAGES
    if (packagesContainer) {
        let pkgHTML = '';
        HotspotConfig.packages.forEach(pkg => {
            pkgHTML += `
                <div class="package-item ${pkg.highlight ? 'highlight' : ''}">
                    <div class="pkg-header">
                        <span>${pkg.name}</span>
                        <span class="pkg-price">${pkg.price}</span>
                    </div>
                    <div class="pkg-desc">${pkg.quota} - صالحة لمدة  ${pkg.duration}</div>
                </div>
            `;
        });
        packagesContainer.innerHTML = pkgHTML;
    }

    // SALES
    if (salesContainer) {
        let saleHTML = '';
        HotspotConfig.salesPoints.forEach(sp => {
            const phoneLink = sp.phone ? `<a href="tel:${sp.phone}" class="sp-phone">📞 ${sp.phone}</a>` : '';
            saleHTML += `
                <div class="sale-point">
                    <div class="sp-name">${sp.name}</div>
                    <div class="sp-address">📍 ${sp.address}</div>
                    ${phoneLink}
                </div>
            `;
        });
        salesContainer.innerHTML = saleHTML;
    }

    // CONTACT
    if (contactContainer) {
        let contactHTML = '<div class="contact-wrapper text-center">';
        HotspotConfig.contact.forEach(c => {
            let href = c.type === 'whatsapp' ? `https://wa.me/${c.value}` : `tel:${c.value}`;
            contactHTML += `
                <a href="${href}" class="contact-btn ${c.type}">
                    ${c.label}
                </a>
            `;
        });
        contactHTML += '</div>';
        contactContainer.innerHTML = contactHTML;
    }
}

function checkMikroTikVars() {
    const errorDiv = document.getElementById('error-msg');
    if (errorDiv && errorDiv.innerText.trim().length <= 2) {
        errorDiv.style.display = 'none';
    }
}

// Byte conversion utility
function readablizeBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 Bytes';
    bytes = Number(bytes);
    const base = (typeof HotspotConfig !== 'undefined' && HotspotConfig.defaultByteBase === 1000) ? 1000 : 1024;
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);
    const value = bytes / Math.pow(base, exp);
    if (exp === 0) return `${Math.round(value)} ${units[exp]}`;
    return `${value.toFixed(2)} ${units[exp]}`;
}

// Fix mobile keyboard pushing navbar
function initMobileKeyboardFix() {
    const navbar = document.querySelector('.bottom-navbar');
    const inputs = document.querySelectorAll('input, select, textarea');

    if (!navbar || window.innerWidth > 768) return;

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            navbar.classList.add('hidden');
        });
        input.addEventListener('blur', () => {
            navbar.classList.remove('hidden');
        });
    });
}
