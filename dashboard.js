// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open') && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target)) {
            sidebar.classList.remove('open');
        }
    });
    
    // Dropdown menus
    const dropdowns = document.querySelectorAll('.user-dropdown');
    
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.user-btn');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (button && menu) {
            // Toggle dropdown on click instead of hover for better mobile experience
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                menu.style.display = 'none';
            });
            
            // Prevent closing when clicking inside dropdown
            menu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    });
    
    // Task checkboxes
    const taskItems = document.querySelectorAll('.task-item input[type="checkbox"]');
    
    taskItems.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if (this.checked) {
                label.style.textDecoration = 'line-through';
                label.style.color = 'var(--dark-gray)';
            } else {
                label.style.textDecoration = 'none';
                label.style.color = 'var(--text-color)';
            }
        });
    });
    
    // Set up activity tracking
    setupActivityTracking();
});

// Update user's active status
function updateActiveStatus() {
    if (typeof API !== 'undefined' && API.auth) {
        API.auth.updateActiveStatus();
    }
}

// Set up activity tracking
function setupActivityTracking() {
    // Update active status immediately
    updateActiveStatus();
    
    // Update active status periodically
    setInterval(updateActiveStatus, 30000); // Every 30 seconds
    
    // Update active status on user interaction
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
        document.addEventListener(event, debounce(() => {
            updateActiveStatus();
        }, 5000)); // Debounce to avoid too many updates
    });
    
    // Update active status before page unload
    window.addEventListener('beforeunload', function() {
        if (typeof API !== 'undefined' && API.auth) {
            API.auth.logout();
        }
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    
    return function() {
        const context = this;
        const args = arguments;
        
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}