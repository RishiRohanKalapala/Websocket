// Function to handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMe = document.getElementById('remember').checked;
    const errorMessage = document.getElementById('error-message');
    
    // Reset error message
    errorMessage.style.display = 'none';
    
    // Basic validation
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }
    
    // Show loading state
    const loginBtn = document.querySelector('.login-btn');
    const originalBtnText = loginBtn.textContent;
    loginBtn.textContent = 'Signing in...';
    loginBtn.disabled = true;
    
    // Use the API to authenticate
    API.auth.login(email, password)
        .then(user => {
            // Save user session
            saveUserSession(user, rememberMe);
            
            // Get user dashboard URL
            const dashboardUrl = getDashboardUrl(user.role);
            
            // Redirect to appropriate dashboard
            window.location.href = dashboardUrl;
        })
        .catch(error => {
            showError('Invalid email or password. Please try again.');
            loginBtn.textContent = originalBtnText;
            loginBtn.disabled = false;
        });
}

// Function to get dashboard URL based on user role
function getDashboardUrl(role) {
    const dashboards = {
        'admin': 'admin-dashboard.html',
        'frontend': 'frontend-dashboard.html',
        'medical': 'medical-dashboard.html',
        'designer': 'design-dashboard.html',
        'java': 'java-dashboard.html',
        'database': 'database-dashboard.html',
        'homeo': 'homeo-dashboard.html'
    };
    
    return dashboards[role] || 'index.html';
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to show error message
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Function to save user session
function saveUserSession(user, rememberMe) {
    // Store in sessionStorage (cleared when browser is closed)
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // If remember me is checked, also store in localStorage
    if (rememberMe) {
        localStorage.setItem('rememberedEmail', user.email);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
    }
}

// Function to check if user is logged in
function checkUserSession() {
    return API.auth.getCurrentUser();
}

// Function to load remembered credentials
function loadRememberedCredentials() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (rememberedEmail && rememberMe === 'true') {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
}

// Function to logout user
function logout() {
    // Use API to logout
    API.auth.logout();
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Initialize login page
function initLoginPage() {
    // Check if user is already logged in
    const currentUser = checkUserSession();
    if (currentUser) {
        // User is already logged in, redirect to their dashboard
        window.location.href = getDashboardUrl(currentUser.role);
        return;
    }
    
    // Load remembered credentials
    loadRememberedCredentials();
    
    // Add event listener to login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add event listener to toggle password visibility
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Add mock credentials info to login page
    addMockCredentialsInfo();
}

// Add mock credentials info to login page
function addMockCredentialsInfo() {
    const loginContainer = document.querySelector('.login-container');
    
    if (loginContainer) {
        // Create credentials info element
        const credentialsInfo = document.createElement('div');
        credentialsInfo.className = 'credentials-info';
        
        credentialsInfo.innerHTML = `
            <h3>Test Credentials</h3>
            <div class="credentials-table">
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Password</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Admin</td>
                            <td>admin@aimpact.com</td>
                            <td>Admin@123</td>
                        </tr>
                        <tr>
                            <td>Frontend Developer</td>
                            <td>dhanush@aimpact.com</td>
                            <td>Dhanush@123</td>
                        </tr>
                        <tr>
                            <td>Medical Advisor</td>
                            <td>srestitha@aimpact.com</td>
                            <td>Srestitha@123</td>
                        </tr>
                        <tr>
                            <td>Designer</td>
                            <td>naveen@aimpact.com</td>
                            <td>Naveen@123</td>
                        </tr>
                        <tr>
                            <td>Java Developer</td>
                            <td>varshith@aimpact.com</td>
                            <td>Varshith@123</td>
                        </tr>
                        <tr>
                            <td>Database & Auth</td>
                            <td>prajwal@aimpact.com</td>
                            <td>Prajwal@123</td>
                        </tr>
                        <tr>
                            <td>Homeo Advisor</td>
                            <td>geethika@aimpact.com</td>
                            <td>Geethika@123</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="credentials-note">Click on any row to auto-fill credentials</p>
        `;
        
        // Insert before footer
        const footer = document.querySelector('.main-footer');
        if (footer) {
            loginContainer.insertBefore(credentialsInfo, footer);
        } else {
            loginContainer.appendChild(credentialsInfo);
        }
        
        // Add click event to table rows
        const rows = credentialsInfo.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('click', function() {
                const email = this.cells[1].textContent;
                const password = this.cells[2].textContent;
                
                document.getElementById('email').value = email;
                document.getElementById('password').value = password;
            });
        });
        
        // Add styles
        addCredentialsStyles();
    }
}

// Add credentials styles
function addCredentialsStyles() {
    // Check if styles already exist
    if (document.getElementById('credentials-styles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'credentials-styles';
    
    // Add CSS
    style.textContent = `
        .credentials-info {
            margin-top: 2rem;
            padding: 1.5rem;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .credentials-info h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--theme-primary);
            text-align: center;
        }
        
        .credentials-table {
            overflow-x: auto;
            margin-bottom: 1rem;
        }
        
        .credentials-table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .credentials-table th,
        .credentials-table td {
            padding: 0.5rem;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        .credentials-table th {
            background-color: var(--theme-primary);
            color: white;
        }
        
        .credentials-table tbody tr {
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .credentials-table tbody tr:hover {
            background-color: rgba(var(--theme-primary-rgb), 0.1);
        }
        
        .credentials-note {
            text-align: center;
            font-size: 0.8rem;
            color: var(--dark-gray);
            margin-bottom: 0;
        }
        
        @media (max-width: 768px) {
            .credentials-table {
                font-size: 0.8rem;
            }
            
            .credentials-table th,
            .credentials-table td {
                padding: 0.4rem;
            }
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
}

// Initialize dashboard page
function initDashboardPage() {
    // Check if user is logged in
    const currentUser = checkUserSession();
    if (!currentUser) {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
        return;
    }
    
    // Update user info in the dashboard
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    const userRoleElement = document.getElementById('user-role');
    if (userRoleElement) {
        userRoleElement.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }
    
    // Add event listener to logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Initialize the appropriate page based on the current URL
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('index.html') || window.location.href.endsWith('/')) {
        initLoginPage();
    } else {
        initDashboardPage();
    }
});