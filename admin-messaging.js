/**
 * Admin Messaging System
 * Allows admin to monitor and access all conversations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const currentUser = API.auth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;
    
    // Initialize admin messaging
    initializeAdminMessaging();
});

// Initialize admin messaging
function initializeAdminMessaging() {
    // Add messaging monitoring card to admin dashboard
    addMessagingMonitoringCard();
}

// Add messaging monitoring card to admin dashboard
function addMessagingMonitoringCard() {
    const dashboardGrid = document.querySelector('.dashboard-grid');
    
    if (dashboardGrid) {
        // Create card
        const card = document.createElement('div');
        card.className = 'dashboard-card messaging-monitoring-card';
        
        card.innerHTML = `
            <div class="card-header">
                <h3>Messaging Monitor</h3>
                <div class="card-actions">
                    <button id="refresh-conversations-btn"><i class="fas fa-sync-alt"></i> Refresh</button>
                </div>
            </div>
            <div class="card-body">
                <div class="messaging-stats">
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <div class="stat-details">
                            <h4>Active Conversations</h4>
                            <p id="active-conversations-count">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-details">
                            <h4>Online Users</h4>
                            <p id="online-users-count">Loading...</p>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-icon">
                            <i class="fas fa-comment-dots"></i>
                        </div>
                        <div class="stat-details">
                            <h4>Total Messages</h4>
                            <p id="total-messages-count">Loading...</p>
                        </div>
                    </div>
                </div>
                <div class="conversations-table-container">
                    <table class="data-table conversations-table">
                        <thead>
                            <tr>
                                <th>Participants</th>
                                <th>Last Message</th>
                                <th>Messages</th>
                                <th>Last Activity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="conversations-table-body">
                            <tr>
                                <td colspan="5" class="loading-message">Loading conversations...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Add to dashboard
        dashboardGrid.appendChild(card);
        
        // Load conversations
        loadAllConversations();
        
        // Add event listeners
        const refreshBtn = card.querySelector('#refresh-conversations-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadAllConversations);
        }
        
        // Add styles
        addAdminMessagingStyles();
    }
}

// Load all conversations
function loadAllConversations() {
    API.messaging.getAllConversations()
        .then(conversations => {
            updateConversationsTable(conversations);
            updateMessagingStats(conversations);
        })
        .catch(error => {
            console.error('Error loading conversations:', error);
            
            // Show error in table
            const tableBody = document.getElementById('conversations-table-body');
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="error-message">
                            Error loading conversations. Please try again.
                        </td>
                    </tr>
                `;
            }
        });
    
    // Get online users
    API.users.getOnlineUsers()
        .then(users => {
            updateOnlineUsersCount(users.length);
        })
        .catch(error => {
            console.error('Error loading online users:', error);
            updateOnlineUsersCount('Error');
        });
}

// Update conversations table
function updateConversationsTable(conversations) {
    const tableBody = document.getElementById('conversations-table-body');
    
    if (tableBody) {
        if (conversations.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">No conversations found.</td>
                </tr>
            `;
            return;
        }
        
        // Clear table
        tableBody.innerHTML = '';
        
        // Add conversations
        conversations.forEach(conversation => {
            const row = document.createElement('tr');
            
            // Format participants
            const participantsHtml = conversation.participants.map(participant => `
                <div class="participant">
                    <img src="${participant.avatar}" alt="${participant.name}" class="participant-avatar">
                    <span class="participant-name">${participant.name}</span>
                    <span class="participant-status ${participant.isOnline ? 'online' : 'offline'}"></span>
                </div>
            `).join('');
            
            // Format last message
            const lastMessageText = conversation.lastMessage 
                ? truncateText(conversation.lastMessage.text, 30)
                : 'No messages yet';
            
            // Format last activity
            const lastActivity = conversation.lastMessage 
                ? formatLastActive(new Date(conversation.lastMessage.timestamp))
                : 'Never';
            
            row.innerHTML = `
                <td>
                    <div class="participants-container">
                        ${participantsHtml}
                    </div>
                </td>
                <td>${lastMessageText}</td>
                <td>${conversation.messageCount}</td>
                <td>${lastActivity}</td>
                <td>
                    <button class="view-conversation-btn" data-id="${conversation.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        const viewButtons = tableBody.querySelectorAll('.view-conversation-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const conversationId = parseInt(this.dataset.id);
                viewConversation(conversationId);
            });
        });
    }
}

// Update messaging stats
function updateMessagingStats(conversations) {
    // Update active conversations count
    const activeConversationsCount = document.getElementById('active-conversations-count');
    if (activeConversationsCount) {
        activeConversationsCount.textContent = conversations.length;
    }
    
    // Update total messages count
    const totalMessagesCount = document.getElementById('total-messages-count');
    if (totalMessagesCount) {
        const totalMessages = conversations.reduce((total, conversation) => {
            return total + conversation.messageCount;
        }, 0);
        
        totalMessagesCount.textContent = totalMessages;
    }
}

// Update online users count
function updateOnlineUsersCount(count) {
    const onlineUsersCount = document.getElementById('online-users-count');
    if (onlineUsersCount) {
        onlineUsersCount.textContent = count;
    }
}

// View conversation
function viewConversation(conversationId) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('view-conversation-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'view-conversation-modal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    // Show loading state
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h2>Conversation</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading conversation...</p>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Add close event
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Get conversation details
    API.messaging.getAllConversations()
        .then(conversations => {
            const conversation = conversations.find(c => c.id === conversationId);
            
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            
            // Get messages
            return API.messaging.getMessages(conversationId)
                .then(messages => {
                    updateConversationModal(modal, conversation, messages);
                    return { conversation, messages };
                });
        })
        .catch(error => {
            console.error('Error loading conversation:', error);
            
            // Show error in modal
            modal.querySelector('.modal-body').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading conversation. Please try again.</p>
                </div>
            `;
        });
}

// Update conversation modal
function updateConversationModal(modal, conversation, messages) {
    // Format participants
    const participantsHtml = conversation.participants.map(participant => `
        <div class="modal-participant">
            <img src="${participant.avatar}" alt="${participant.name}" class="participant-avatar">
            <div class="participant-info">
                <span class="participant-name">${participant.name}</span>
                <span class="participant-role">${formatRole(participant.role)}</span>
            </div>
            <span class="participant-status ${participant.isOnline ? 'online' : 'offline'}">
                ${participant.isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    `).join('');
    
    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);
    
    // Format messages
    let messagesHtml = '';
    
    if (messages.length === 0) {
        messagesHtml = `
            <div class="no-messages">
                <p>No messages in this conversation yet.</p>
            </div>
        `;
    } else {
        // Add messages by date
        Object.keys(groupedMessages).forEach(date => {
            // Add date separator
            messagesHtml += `<div class="date-separator">${date}</div>`;
            
            // Add messages for this date
            groupedMessages[date].forEach(message => {
                // Get sender
                const sender = conversation.participants.find(p => p.id === message.senderId);
                
                if (!sender) return;
                
                messagesHtml += `
                    <div class="modal-message">
                        <div class="message-sender">
                            <img src="${sender.avatar}" alt="${sender.name}" class="sender-avatar">
                        </div>
                        <div class="message-content">
                            <div class="message-header">
                                <span class="sender-name">${sender.name}</span>
                                <span class="message-time">${formatMessageTime(new Date(message.timestamp), true)}</span>
                            </div>
                            <div class="message-text">${formatMessageText(message.text)}</div>
                        </div>
                    </div>
                `;
            });
        });
    }
    
    // Update modal content
    modal.querySelector('.modal-body').innerHTML = `
        <div class="conversation-details">
            <h3>Participants</h3>
            <div class="participants-list">
                ${participantsHtml}
            </div>
        </div>
        <div class="conversation-messages">
            <h3>Messages</h3>
            <div class="messages-list">
                ${messagesHtml}
            </div>
        </div>
    `;
    
    // Scroll to bottom of messages
    const messagesList = modal.querySelector('.messages-list');
    if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
    }
}

// Helper Functions

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

// Format last active time
function formatLastActive(date) {
    const now = new Date();
    const diff = now - date;
    
    // If less than 1 minute
    if (diff < 60 * 1000) {
        return 'Just now';
    }
    
    // If less than 1 hour
    if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // If less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // If less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise, show date
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Format message time
function formatMessageTime(date, includeSeconds = false) {
    const options = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    if (includeSeconds) {
        options.second = '2-digit';
    }
    
    return date.toLocaleTimeString('en-US', options);
}

// Format date
function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Format message text (handle line breaks, links, etc.)
function formatMessageText(text) {
    // Replace line breaks with <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Make links clickable
    formattedText = formattedText.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return formattedText;
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Group messages by date
function groupMessagesByDate(messages) {
    const groups = {};
    
    messages.forEach(message => {
        const date = formatDate(new Date(message.timestamp));
        
        if (!groups[date]) {
            groups[date] = [];
        }
        
        groups[date].push(message);
    });
    
    return groups;
}

// Add admin messaging styles
function addAdminMessagingStyles() {
    // Check if styles already exist
    if (document.getElementById('admin-messaging-styles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'admin-messaging-styles';
    
    // Add CSS
    style.textContent = `
        /* Messaging Monitoring Card */
        .messaging-monitoring-card {
            grid-column: 1 / -1;
        }
        
        .messaging-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
        }
        
        .stat-item {
            background-color: white;
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-md);
            display: flex;
            align-items: center;
            box-shadow: var(--shadow-sm);
            border-left: 4px solid var(--theme-primary);
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
            background-color: rgba(var(--theme-primary-rgb), 0.1);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: var(--spacing-md);
            color: var(--theme-primary);
            font-size: 1.2rem;
        }
        
        .stat-details h4 {
            margin: 0;
            font-size: 0.9rem;
            color: var(--dark-gray);
            margin-bottom: var(--spacing-xs);
        }
        
        .stat-details p {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .conversations-table-container {
            overflow-x: auto;
        }
        
        .conversations-table {
            min-width: 800px;
        }
        
        .loading-message, .empty-message, .error-message {
            text-align: center;
            padding: var(--spacing-lg);
            color: var(--dark-gray);
        }
        
        .error-message {
            color: var(--error-color);
        }
        
        .participants-container {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
        }
        
        .participant {
            display: flex;
            align-items: center;
        }
        
        .participant-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: var(--spacing-sm);
        }
        
        .participant-name {
            margin-right: var(--spacing-sm);
        }
        
        .participant-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        
        .participant-status.online {
            background-color: var(--success-color);
        }
        
        .participant-status.offline {
            background-color: var(--dark-gray);
        }
        
        .view-conversation-btn {
            background-color: var(--theme-secondary);
            color: white;
            border: none;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        /* Modal Styles */
        .modal-content.large {
            max-width: 900px;
            height: 80vh;
            display: flex;
            flex-direction: column;
        }
        
        .modal-body {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(var(--theme-primary-rgb), 0.1);
            border-left-color: var(--theme-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: var(--spacing-md);
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .conversation-details, .conversation-messages {
            padding: var(--spacing-md);
        }
        
        .conversation-details {
            border-bottom: 1px solid var(--light-gray);
        }
        
        .conversation-details h3, .conversation-messages h3 {
            margin-top: 0;
            margin-bottom: var(--spacing-md);
            font-size: 1.1rem;
            color: var(--theme-primary);
        }
        
        .participants-list {
            display: flex;
            gap: var(--spacing-md);
            flex-wrap: wrap;
        }
        
        .modal-participant {
            display: flex;
            align-items: center;
            background-color: var(--light-gray);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius-sm);
        }
        
        .participant-info {
            margin: 0 var(--spacing-md);
        }
        
        .participant-name {
            display: block;
            font-weight: 500;
        }
        
        .participant-role {
            display: block;
            font-size: 0.8rem;
            color: var(--dark-gray);
        }
        
        .modal-participant .participant-status {
            width: auto;
            height: auto;
            background-color: transparent;
            font-size: 0.8rem;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius-sm);
        }
        
        .modal-participant .participant-status.online {
            background-color: rgba(var(--success-rgb), 0.1);
            color: var(--success-color);
        }
        
        .modal-participant .participant-status.offline {
            background-color: rgba(0, 0, 0, 0.05);
            color: var(--dark-gray);
        }
        
        .conversation-messages {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .messages-list {
            flex: 1;
            overflow-y: auto;
            background-color: #f9f9f9;
            border-radius: var(--border-radius-sm);
            padding: var(--spacing-md);
        }
        
        .no-messages {
            text-align: center;
            padding: var(--spacing-xl) 0;
            color: var(--dark-gray);
        }
        
        .date-separator {
            text-align: center;
            margin: var(--spacing-md) 0;
            font-size: 0.8rem;
            color: var(--dark-gray);
            position: relative;
        }
        
        .date-separator::before,
        .date-separator::after {
            content: '';
            position: absolute;
            top: 50%;
            width: calc(50% - 50px);
            height: 1px;
            background-color: var(--medium-gray);
        }
        
        .date-separator::before {
            left: 0;
        }
        
        .date-separator::after {
            right: 0;
        }
        
        .modal-message {
            display: flex;
            margin-bottom: var(--spacing-md);
        }
        
        .message-sender {
            margin-right: var(--spacing-md);
        }
        
        .sender-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
        }
        
        .message-content {
            flex: 1;
            background-color: white;
            border-radius: var(--border-radius-md);
            padding: var(--spacing-sm) var(--spacing-md);
            box-shadow: var(--shadow-sm);
        }
        
        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-xs);
        }
        
        .sender-name {
            font-weight: 500;
        }
        
        .message-time {
            font-size: 0.8rem;
            color: var(--dark-gray);
        }
        
        .message-text {
            white-space: pre-wrap;
            word-break: break-word;
        }
        
        .message-text a {
            color: var(--theme-secondary);
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
}