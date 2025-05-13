/**
 * Notifications and Tasks Handler for User Dashboards
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize notifications
    initializeNotifications();
    
    // Initialize tasks
    initializeTasks();
    
    // Set up notification click handler
    setupNotificationClickHandler();
});

// Initialize notifications
function initializeNotifications() {
    // Get notifications for current user
    API.notifications.getForCurrentUser()
        .then(notifications => {
            updateNotificationBadge(notifications);
            populateNotificationDropdown(notifications);
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
        });
}

// Initialize tasks
function initializeTasks() {
    // Get tasks for current user
    API.tasks.getForCurrentUser()
        .then(tasks => {
            updateTasksList(tasks);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

// Update notification badge count
function updateNotificationBadge(notifications) {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.action-btn .badge');
    
    if (badge) {
        badge.textContent = unreadCount;
        
        // Hide badge if no unread notifications
        if (unreadCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }
}

// Populate notification dropdown
function populateNotificationDropdown(notifications) {
    // Create notification dropdown if it doesn't exist
    let notificationDropdown = document.querySelector('.notification-dropdown');
    
    if (!notificationDropdown) {
        // Get the notification bell button
        const bellButton = document.querySelector('.action-btn i.fa-bell').parentNode;
        
        // Create dropdown
        notificationDropdown = document.createElement('div');
        notificationDropdown.className = 'notification-dropdown';
        notificationDropdown.style.display = 'none';
        bellButton.appendChild(notificationDropdown);
        
        // Add event listener to toggle dropdown
        bellButton.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            notificationDropdown.style.display = 'none';
        });
        
        // Prevent closing when clicking inside dropdown
        notificationDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Clear existing notifications
    notificationDropdown.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'dropdown-header';
    header.innerHTML = '<h3>Notifications</h3>';
    notificationDropdown.appendChild(header);
    
    // Add notifications or empty message
    if (notifications.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No notifications';
        notificationDropdown.appendChild(emptyMessage);
    } else {
        // Sort notifications by timestamp (newest first)
        const sortedNotifications = [...notifications].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Create notification list
        const notificationList = document.createElement('div');
        notificationList.className = 'notification-list';
        
        // Add notifications (limit to 5 most recent)
        sortedNotifications.slice(0, 5).forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            notificationItem.dataset.id = notification.id;
            
            if (!notification.read) {
                notificationItem.classList.add('unread');
            }
            
            // Format date
            const date = new Date(notification.timestamp);
            const formattedDate = formatDate(date);
            
            notificationItem.innerHTML = `
                <div class="notification-content">
                    <p class="notification-title">${notification.title}</p>
                    <p class="notification-message">${notification.message}</p>
                    <p class="notification-time">${formattedDate}</p>
                </div>
            `;
            
            notificationList.appendChild(notificationItem);
        });
        
        notificationDropdown.appendChild(notificationList);
        
        // Add view all link if more than 5 notifications
        if (notifications.length > 5) {
            const viewAll = document.createElement('div');
            viewAll.className = 'view-all';
            viewAll.innerHTML = '<a href="#">View All Notifications</a>';
            notificationDropdown.appendChild(viewAll);
        }
    }
    
    // Add styles if not already added
    addNotificationStyles();
}

// Update tasks list
function updateTasksList(tasks) {
    // Find task list container
    const taskList = document.querySelector('.task-list');
    
    if (taskList) {
        // Clear existing tasks
        taskList.innerHTML = '';
        
        // Sort tasks by due date (closest first)
        const sortedTasks = [...tasks].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        // Add tasks
        sortedTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `task-${task.id}`;
            checkbox.checked = task.completed;
            
            // Add event listener to update task status
            checkbox.addEventListener('change', function() {
                API.tasks.updateStatus(task.id, this.checked)
                    .then(success => {
                        if (success) {
                            // Update task item styling
                            const label = this.nextElementSibling;
                            if (this.checked) {
                                label.style.textDecoration = 'line-through';
                                label.style.color = 'var(--dark-gray)';
                            } else {
                                label.style.textDecoration = 'none';
                                label.style.color = 'var(--text-color)';
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error updating task status:', error);
                        // Revert checkbox state on error
                        this.checked = !this.checked;
                    });
            });
            
            const label = document.createElement('label');
            label.htmlFor = `task-${task.id}`;
            label.textContent = task.title;
            
            // Apply styling for completed tasks
            if (task.completed) {
                label.style.textDecoration = 'line-through';
                label.style.color = 'var(--dark-gray)';
            }
            
            const dueDate = document.createElement('span');
            dueDate.className = 'task-due';
            dueDate.textContent = task.dueDate ? `Due: ${formatDate(new Date(task.dueDate))}` : '';
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(label);
            taskItem.appendChild(dueDate);
            taskList.appendChild(taskItem);
        });
        
        // If no tasks, add a message
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No tasks assigned';
            taskList.appendChild(emptyMessage);
        }
    }
}

// Set up notification click handler
function setupNotificationClickHandler() {
    // Add event delegation for notification clicks
    document.addEventListener('click', function(e) {
        // Check if clicked element is a notification or its child
        const notificationItem = e.target.closest('.notification-item');
        
        if (notificationItem) {
            const notificationId = parseInt(notificationItem.dataset.id);
            
            // Mark notification as read
            API.notifications.markAsRead(notificationId)
                .then(success => {
                    if (success) {
                        // Update UI
                        notificationItem.classList.remove('unread');
                        
                        // Refresh notification badge
                        API.notifications.getForCurrentUser()
                            .then(notifications => {
                                updateNotificationBadge(notifications);
                            });
                    }
                })
                .catch(error => {
                    console.error('Error marking notification as read:', error);
                });
        }
    });
}

// Format date helper
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    
    // If less than 24 hours, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
        // If less than 1 hour, show minutes
        if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        
        // If less than 24 hours, show hours
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // If less than 7 days, show day of week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }
    
    // Otherwise, show date
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Add notification styles
function addNotificationStyles() {
    // Check if styles already exist
    if (document.getElementById('notification-styles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'notification-styles';
    
    // Add CSS
    style.textContent = `
        .notification-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background-color: white;
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-md);
            min-width: 300px;
            max-width: 400px;
            z-index: 100;
            overflow: hidden;
        }
        
        .dropdown-header {
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
        }
        
        .dropdown-header h3 {
            margin: 0;
            font-size: 1rem;
        }
        
        .notification-list {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .notification-item {
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .notification-item:hover {
            background-color: var(--light-gray);
        }
        
        .notification-item.unread {
            background-color: rgba(var(--theme-secondary-rgb, 52, 152, 219), 0.1);
        }
        
        .notification-title {
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
        }
        
        .notification-message {
            font-size: 0.9rem;
            margin-bottom: var(--spacing-xs);
        }
        
        .notification-time {
            font-size: 0.8rem;
            color: var(--dark-gray);
        }
        
        .empty-message {
            padding: var(--spacing-md);
            text-align: center;
            color: var(--dark-gray);
        }
        
        .view-all {
            padding: var(--spacing-md);
            text-align: center;
            border-top: 1px solid var(--light-gray);
        }
        
        .view-all a {
            color: var(--theme-secondary);
            text-decoration: none;
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
}