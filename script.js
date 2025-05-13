document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    const errorMessage = document.getElementById('error-message');
    const rememberCheckbox = document.getElementById('remember');

    // Check if there are saved credentials
    checkSavedCredentials();

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset error message
        hideError();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Basic validation
        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }
        
        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }
        
        // Here you would typically send the credentials to your server for authentication
        // For this example, we'll simulate a login process
        simulateLogin(email, password);
    });

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Function to hide error message
    function hideError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    // Function to simulate login (replace with actual authentication)
    function simulateLogin(email, password) {
        // Show loading state
        const loginBtn = document.querySelector('.login-btn');
        const originalBtnText = loginBtn.textContent;
        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;
        
        // Simulate API call with timeout
        setTimeout(() => {
            // This is where you would validate credentials against your backend
            // For demo purposes, we'll use a simple check
            // In a real application, NEVER hardcode credentials like this
            // This is just for demonstration
            
            const isValidCredentials = true; // Replace with actual validation
            
            if (isValidCredentials) {
                // Save credentials if "Remember me" is checked
                if (rememberCheckbox.checked) {
                    saveCredentials(email);
                } else {
                    clearSavedCredentials();
                }
                
                // Redirect to dashboard or home page
                window.location.href = 'dashboard.html'; // Change to your actual dashboard page
            } else {
                showError('Invalid email or password. Please try again.');
                loginBtn.textContent = originalBtnText;
                loginBtn.disabled = false;
            }
        }, 1500);
    }

    // Function to save credentials (only email for security reasons)
    function saveCredentials(email) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
    }

    // Function to clear saved credentials
    function clearSavedCredentials() {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
    }

    // Function to check and load saved credentials
    function checkSavedCredentials() {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (savedEmail && rememberMe === 'true') {
            emailInput.value = savedEmail;
            rememberCheckbox.checked = true;
        }
    }
});