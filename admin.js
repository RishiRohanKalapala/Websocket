/**
 * Admin Dashboard Functionality
 * Handles sending alerts and assigning tasks to users
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin dashboard
    initializeAdminDashboard();
});

// Initialize admin dashboard
function initializeAdminDashboard() {
    // Check if current user is admin
    const currentUser = API.auth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        // Not admin, redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    // Load users
    loadUsers();
    
    // Add admin controls to dashboard
    addAdminControls();
    
    // Initialize notifications
    initializeNotifications();
    
    // Initialize tasks
    initializeTasks();
}

// Load users
function loadUsers() {
    API.users.getAll()
        .then(users => {
            // Update user table
            updateUserTable(users);
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

// Update user table
function updateUserTable(users) {
    const userTable = document.querySelector('.data-table tbody');
    
    if (userTable) {
        // Clear existing rows
        userTable.innerHTML = '';
        
        // Add users
        users.forEach(user => {
            // Skip admin user
            if (user.role === 'admin') return;
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${formatRole(user.role)}</td>
                <td>
                    <button class="icon-btn edit-user" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn delete-user" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                    <button class="icon-btn send-alert" data-id="${user.id}"><i class="fas fa-bell"></i></button>
                    <button class="icon-btn assign-task" data-id="${user.id}"><i class="fas fa-tasks"></i></button>
                </td>
            `;
            
            userTable.appendChild(row);
        });
        
        // Add event listeners
        addUserTableEventListeners();
    }
}

// Format role for display
function formatRole(role) {
    const roles = {
        'admin': 'Administrator',
        'frontend': 'Frontend Developer',
        'medical': 'Medical Advisor',
        'designer': 'Designer',
        'java': 'Java Developer',
        'database': 'Database & Auth',
        'homeo': 'Homeo Advisor'
    };
    
    return roles[role] || role;
}

// Add event listeners to user table
function addUserTableEventListeners() {
    // Send alert buttons
    document.querySelectorAll('.send-alert').forEach(button => {
        button.addEventListener('click', function() {
            const userId = parseInt(this.dataset.id);
            showSendAlertModal(userId);
        });
    });
    
    // Assign task buttons
    document.querySelectorAll('.assign-task').forEach(button => {
        button.addEventListener('click', function() {
            const userId = parseInt(this.dataset.id);
            showAssignTaskModal(userId);
        });
    });
}

// Add admin controls to dashboard
function addAdminControls() {
    // Add "Send Alert to All" button to header actions
    const headerActions = document.querySelector('.header-actions');
    
    if (headerActions) {
        const sendAlertButton = document.createElement('button');
        sendAlertButton.className = 'action-btn send-alert-all';
        sendAlertButton.innerHTML = '<i class="fas fa-bullhorn"></i>';
        sendAlertButton.title = 'Send Alert to All Users';
        
        // Insert before user dropdown
        const userDropdown = headerActions.querySelector('.user-dropdown');
        headerActions.insertBefore(sendAlertButton, userDropdown);
        
        // Add event listener
        sendAlertButton.addEventListener('click', function() {
            showSendAlertModal('all');
        });
    }
    
    // Add "Assign Task to Multiple Users" button
    const cardActions = document.querySelector('.card-header .card-actions');
    
    if (cardActions) {
        const assignTaskButton = document.createElement('button');
        assignTaskButton.innerHTML = '<i class="fas fa-tasks"></i> Assign Task';
        assignTaskButton.className = 'assign-task-multiple';
        
        cardActions.appendChild(assignTaskButton);
        
        // Add event listener
        assignTaskButton.addEventListener('click', function() {
            showAssignTaskModal('multiple');
        });
    }
}

// Show send alert modal
function showSendAlertModal(recipient) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('send-alert-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'send-alert-modal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    // Get recipient name
    let recipientName = 'All Users';
    
    if (recipient !== 'all') {
        API.users.getById(recipient)
            .then(user => {
                recipientName = user.name;
                updateModalContent();
            })
            .catch(error => {
                console.error('Error getting user:', error);
                recipientName = 'User';
                updateModalContent();
            });
    } else {
        updateModalContent();
    }
    
    // Update modal content
    function updateModalContent() {
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Send Alert to ${recipientName}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="send-alert-form">
                        <div class="form-group">
                            <label for="alert-title">Alert Title</label>
                            <input type="text" id="alert-title" required>
                        </div>
                        <div class="form-group">
                            <label for="alert-message">Message</label>
                            <textarea id="alert-message" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="alert-priority">Priority</label>
                            <select id="alert-priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">Send Alert</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#send-alert-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('alert-title').value;
            const message = document.getElementById('alert-message').value;
            const priority = document.getElementById('alert-priority').value;
            
            // Create notification object
            const notification = {
                title: title,
                message: message,
                priority: priority,
                type: 'alert',
                from: {
                    id: API.auth.getCurrentUser().id,
                    name: API.auth.getCurrentUser().name
                },
                recipients: recipient === 'all' ? 'all' : [recipient]
            };
            
            // Send notification
            API.notifications.send(notification)
                .then(result => {
                    // Close modal
                    modal.style.display = 'none';
                    
                    // Show success message
                    showToast('Alert sent successfully!');
                })
                .catch(error => {
                    console.error('Error sending alert:', error);
                    showToast('Error sending alert. Please try again.', 'error');
                });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Show assign task modal
function showAssignTaskModal(recipient) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('assign-task-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'assign-task-modal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    // Get users for multiple recipients
    if (recipient === 'multiple') {
        API.users.getAll()
            .then(users => {
                // Filter out admin
                const filteredUsers = users.filter(user => user.role !== 'admin');
                updateModalContent(filteredUsers);
            })
            .catch(error => {
                console.error('Error getting users:', error);
                updateModalContent([]);
            });
    } else {
        API.users.getById(recipient)
            .then(user => {
                updateModalContent(null, user);
            })
            .catch(error => {
                console.error('Error getting user:', error);
                updateModalContent();
            });
    }
    
    // Update modal content
    function updateModalContent(users = [], user = null) {
        let recipientName = user ? user.name : 'Multiple Users';
        let recipientSelector = '';
        
        if (recipient === 'multiple') {
            recipientSelector = `
                <div class="form-group">
                    <label>Select Users</label>
                    <div class="checkbox-group">
                        ${users.map(u => `
                            <div class="checkbox-item">
                                <input type="checkbox" id="user-${u.id}" name="task-users" value="${u.id}">
                                <label for="user-${u.id}">${u.name}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Assign Task to ${recipientName}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="assign-task-form">
                        ${recipientSelector}
                        <div class="form-group">
                            <label for="task-title">Task Title</label>
                            <input type="text" id="task-title" required>
                        </div>
                        <div class="form-group">
                            <label for="task-description">Description</label>
                            <textarea id="task-description" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="task-due-date">Due Date</label>
                            <input type="date" id="task-due-date" required>
                        </div>
                        <div class="form-group">
                            <label for="task-priority">Priority</label>
                            <select id="task-priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="submit-btn">Assign Task</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'block';
        
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('task-due-date').min = today;
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#assign-task-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const dueDate = document.getElementById('task-due-date').value;
            const priority = document.getElementById('task-priority').value;
            
            // Get assignees
            let assignees = [];
            
            if (recipient === 'multiple') {
                // Get selected users
                const checkboxes = document.querySelectorAll('input[name="task-users"]:checked');
                assignees = Array.from(checkboxes).map(cb => parseInt(cb.value));
                
                if (assignees.length === 0) {
                    showToast('Please select at least one user.', 'error');
                    return;
                }
            } else {
                assignees = [recipient];
            }
            
            // Create task object
            const task = {
                title: title,
                description: description,
                dueDate: dueDate,
                priority: priority,
                assignedBy: {
                    id: API.auth.getCurrentUser().id,
                    name: API.auth.getCurrentUser().name
                },
                assignees: assignees
            };
            
            // Assign task
            API.tasks.assign(task)
                .then(result => {
                    // Close modal
                    modal.style.display = 'none';
                    
                    // Show success message
                    showToast('Task assigned successfully!');
                    
                    // Send notification about new task
                    const notification = {
                        title: 'New Task Assigned',
                        message: `You have been assigned a new task: ${title}`,
                        priority: priority,
                        type: 'task',
                        from: {
                            id: API.auth.getCurrentUser().id,
                            name: API.auth.getCurrentUser().name
                        },
                        recipients: assignees
                    };
                    
                    API.notifications.send(notification);
                })
                .catch(error => {
                    console.error('Error assigning task:', error);
                    showToast('Error assigning task. Please try again.', 'error');
                });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Show toast message
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add admin styles
function addAdminStyles() {
    // Check if styles already exist
    if (document.getElementById('admin-styles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'admin-styles';
    
    // Add CSS
    style.textContent = `
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            overflow: auto;
        }
        
        .modal-content {
            background-color: white;
            margin: 10% auto;
            padding: 0;
            width: 90%;
            max-width: 500px;
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-lg);
            animation: modalFadeIn 0.3s;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-header {
            padding: var(--spacing-md) var(--spacing-lg);
            background-color: var(--theme-primary);
            color: white;
            border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 1.2rem;
        }
        
        .close-modal {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }
        
        .modal-body {
            padding: var(--spacing-lg);
        }
        
        .form-group {
            margin-bottom: var(--spacing-md);
        }
        
        .form-group label {
            display: block;
            margin-bottom: var(--spacing-xs);
            font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: var(--spacing-sm);
            border: 1px solid var(--medium-gray);
            border-radius: var(--border-radius-sm);
        }
        
        .checkbox-group {
            max-height: 150px;
            overflow-y: auto;
            border: 1px solid var(--medium-gray);
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-sm);
        }
        
        .checkbox-item {
            margin-bottom: var(--spacing-xs);
        }
        
        .checkbox-item:last-child {
            margin-bottom: 0;
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: var(--spacing-lg);
        }
        
        .cancel-btn {
            background-color: var(--medium-gray);
            color: var(--text-color);
            border: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            margin-right: var(--spacing-sm);
        }
        
        .submit-btn {
            background-color: var(--theme-secondary);
            color: white;
            border: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
        }
        
        /* Toast Styles */
        .toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1001;
        }
        
        .toast {
            background-color: white;
            color: var(--text-color);
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--border-radius-sm);
            box-shadow: var(--shadow-md);
            margin-top: var(--spacing-sm);
            transform: translateX(120%);
            transition: transform 0.3s ease-out;
            max-width: 300px;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            border-left: 4px solid var(--success-color);
        }
        
        .toast.error {
            border-left: 4px solid var(--error-color);
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
}

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

// Add admin styles when document loads
addAdminStyles();