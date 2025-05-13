/**
 * Messaging System for AImpact & AIdex
 * Handles user-to-user messaging with online status indicators
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize messaging system
    initializeMessaging();
    
    // Set up activity tracking
    setupActivityTracking();
});

// Global variables
let currentConversation = null;
let messagePollingInterval = null;
let onlineUsersPollingInterval = null;

// Initialize messaging system
function initializeMessaging() {
    // Check if user is logged in
    const currentUser = API.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Add messaging icon to header actions
    addMessagingIcon();
    
    // Create messaging panel
    createMessagingPanel();
    
    // Load conversations
    loadConversations();
    
    // Start polling for online users
    startOnlineUsersPolling();
    
    // Add message badge to user dropdown
    updateMessageBadge();
}

// Add messaging icon to header actions
function addMessagingIcon() {
    const headerActions = document.querySelector('.header-actions');
    
    if (headerActions) {
        // Check if icon already exists
        if (headerActions.querySelector('.messaging-btn')) return;
        
        // Create messaging button
        const messagingBtn = document.createElement('button');
        messagingBtn.className = 'action-btn messaging-btn';
        messagingBtn.innerHTML = '<i class="fas fa-comments"></i>';
        messagingBtn.title = 'Messages';
        
        // Add message badge
        const badge = document.createElement('span');
        badge.className = 'badge message-badge';
        badge.style.display = 'none';
        messagingBtn.appendChild(badge);
        
        // Insert before user dropdown
        const userDropdown = headerActions.querySelector('.user-dropdown');
        headerActions.insertBefore(messagingBtn, userDropdown);
        
        // Add event listener
        messagingBtn.addEventListener('click', toggleMessagingPanel);
    }
}

// Create messaging panel
function createMessagingPanel() {
    // Check if panel already exists
    if (document.getElementById('messaging-panel')) return;
    
    // Create panel
    const panel = document.createElement('div');
    panel.id = 'messaging-panel';
    panel.className = 'messaging-panel';
    panel.style.display = 'none';
    
    // Panel content
    panel.innerHTML = `
        <div class="messaging-header">
            <h3>Messages</h3>
            <button class="close-panel"><i class="fas fa-times"></i></button>
        </div>
        <div class="messaging-content">
            <div class="conversations-list">
                <div class="search-container">
                    <input type="text" id="user-search" placeholder="Search users...">
                    <button id="new-message-btn"><i class="fas fa-plus"></i></button>
                </div>
                <div class="conversations"></div>
            </div>
            <div class="conversation-view">
                <div class="conversation-header">
                    <div class="conversation-info">
                        <div class="user-avatar"></div>
                        <div class="user-details">
                            <h4 class="user-name">Select a conversation</h4>
                            <p class="user-status"></p>
                        </div>
                    </div>
                </div>
                <div class="messages-container">
                    <div class="messages"></div>
                </div>
                <div class="message-input-container">
                    <textarea id="message-input" placeholder="Type a message..." disabled></textarea>
                    <button id="send-message-btn" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(panel);
    
    // Add event listeners
    panel.querySelector('.close-panel').addEventListener('click', toggleMessagingPanel);
    panel.querySelector('#new-message-btn').addEventListener('click', showNewMessageModal);
    panel.querySelector('#send-message-btn').addEventListener('click', sendMessage);
    panel.querySelector('#message-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Add search functionality
    panel.querySelector('#user-search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterConversations(searchTerm);
    });
    
    // Add messaging styles
    addMessagingStyles();
}

// Toggle messaging panel
function toggleMessagingPanel() {
    const panel = document.getElementById('messaging-panel');
    
    if (panel) {
        const isVisible = panel.style.display === 'block';
        panel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // Refresh conversations when opening
            loadConversations();
            
            // Focus search input
            setTimeout(() => {
                const searchInput = document.getElementById('user-search');
                if (searchInput) searchInput.focus();
            }, 100);
        } else {
            // Stop message polling when closing
            stopMessagePolling();
        }
    }
}

// Load conversations
function loadConversations() {
    API.messaging.getConversations()
        .then(conversations => {
            updateConversationsList(conversations);
        })
        .catch(error => {
            console.error('Error loading conversations:', error);
        });
}

// Update conversations list
function updateConversationsList(conversations) {
    const conversationsContainer = document.querySelector('.conversations');
    
    if (conversationsContainer) {
        // Clear existing conversations
        conversationsContainer.innerHTML = '';
        
        if (conversations.length === 0) {
            // No conversations
            conversationsContainer.innerHTML = `
                <div class="no-conversations">
                    <p>No conversations yet</p>
                    <button id="start-conversation-btn">Start a conversation</button>
                </div>
            `;
            
            // Add event listener
            const startBtn = conversationsContainer.querySelector('#start-conversation-btn');
            if (startBtn) {
                startBtn.addEventListener('click', showNewMessageModal);
            }
        } else {
            // Add conversations
            conversations.forEach(conversation => {
                const conversationItem = document.createElement('div');
                conversationItem.className = 'conversation-item';
                conversationItem.dataset.id = conversation.id;
                
                // Add active class if this is the current conversation
                if (currentConversation && currentConversation.id === conversation.id) {
                    conversationItem.classList.add('active');
                }
                
                // Get other participant
                const otherParticipant = conversation.otherParticipant;
                
                if (!otherParticipant) return;
                
                // Format last message time
                const lastMessageTime = conversation.lastMessage 
                    ? formatMessageTime(new Date(conversation.lastMessage.timestamp))
                    : '';
                
                // Get last message text
                const lastMessageText = conversation.lastMessage 
                    ? truncateText(conversation.lastMessage.text, 30)
                    : 'No messages yet';
                
                // Online status indicator
                const onlineStatus = otherParticipant.isOnline 
                    ? '<span class="online-indicator"></span>'
                    : '';
                
                conversationItem.innerHTML = `
                    <div class="conversation-avatar">
                        <img src="${otherParticipant.avatar}" alt="${otherParticipant.name}">
                        ${onlineStatus}
                    </div>
                    <div class="conversation-details">
                        <div class="conversation-header">
                            <h4 class="conversation-name">${otherParticipant.name}</h4>
                            <span class="conversation-time">${lastMessageTime}</span>
                        </div>
                        <p class="conversation-last-message">${lastMessageText}</p>
                    </div>
                    ${conversation.unreadCount > 0 ? `<span class="unread-badge">${conversation.unreadCount}</span>` : ''}
                `;
                
                // Add event listener
                conversationItem.addEventListener('click', function() {
                    openConversation(conversation.id);
                });
                
                conversationsContainer.appendChild(conversationItem);
            });
        }
    }
    
    // Update message badge
    updateMessageBadge();
}

// Filter conversations
function filterConversations(searchTerm) {
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    conversationItems.forEach(item => {
        const name = item.querySelector('.conversation-name').textContent.toLowerCase();
        
        if (name.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Open conversation
function openConversation(conversationId) {
    // Stop previous polling
    stopMessagePolling();
    
    // Update active conversation
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
        item.classList.remove('active');
        
        if (item.dataset.id == conversationId) {
            item.classList.add('active');
            
            // Remove unread badge
            const unreadBadge = item.querySelector('.unread-badge');
            if (unreadBadge) {
                unreadBadge.remove();
            }
        }
    });
    
    // Get conversation
    API.messaging.getMessages(conversationId)
        .then(messages => {
            // Get conversation details
            return API.messaging.getConversations()
                .then(conversations => {
                    const conversation = conversations.find(c => c.id === conversationId);
                    currentConversation = conversation;
                    
                    // Update conversation header
                    updateConversationHeader(conversation);
                    
                    // Update messages
                    updateMessagesContainer(messages);
                    
                    // Enable message input
                    enableMessageInput();
                    
                    // Start polling for new messages
                    startMessagePolling(conversationId);
                    
                    return messages;
                });
        })
        .catch(error => {
            console.error('Error opening conversation:', error);
        });
}

// Update conversation header
function updateConversationHeader(conversation) {
    if (!conversation) return;
    
    const header = document.querySelector('.conversation-header');
    
    if (header) {
        const otherParticipant = conversation.otherParticipant;
        
        if (otherParticipant) {
            const userAvatar = header.querySelector('.user-avatar');
            const userName = header.querySelector('.user-name');
            const userStatus = header.querySelector('.user-status');
            
            if (userAvatar) {
                userAvatar.innerHTML = `<img src="${otherParticipant.avatar}" alt="${otherParticipant.name}">`;
            }
            
            if (userName) {
                userName.textContent = otherParticipant.name;
            }
            
            if (userStatus) {
                if (otherParticipant.isOnline) {
                    userStatus.innerHTML = '<span class="status-indicator online"></span> Online';
                } else if (otherParticipant.lastActive) {
                    const lastActive = new Date(otherParticipant.lastActive);
                    userStatus.innerHTML = `<span class="status-indicator offline"></span> Last active ${formatLastActive(lastActive)}`;
                } else {
                    userStatus.innerHTML = '<span class="status-indicator offline"></span> Offline';
                }
            }
        }
    }
}

// Update messages container
function updateMessagesContainer(messages) {
    const messagesContainer = document.querySelector('.messages');
    
    if (messagesContainer) {
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            // No messages
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <p>No messages yet</p>
                    <p class="hint">Send a message to start the conversation</p>
                </div>
            `;
        } else {
            // Group messages by date
            const groupedMessages = groupMessagesByDate(messages);
            
            // Add messages
            Object.keys(groupedMessages).forEach(date => {
                // Add date separator
                const dateSeparator = document.createElement('div');
                dateSeparator.className = 'date-separator';
                dateSeparator.textContent = date;
                messagesContainer.appendChild(dateSeparator);
                
                // Add messages for this date
                groupedMessages[date].forEach(message => {
                    const messageItem = document.createElement('div');
                    const currentUser = API.auth.getCurrentUser();
                    const isCurrentUser = message.senderId === currentUser.id;
                    
                    messageItem.className = `message-item ${isCurrentUser ? 'sent' : 'received'}`;
                    messageItem.dataset.id = message.id;
                    
                    messageItem.innerHTML = `
                        <div class="message-content">
                            <p class="message-text">${formatMessageText(message.text)}</p>
                            <span class="message-time">${formatMessageTime(new Date(message.timestamp), true)}</span>
                        </div>
                    `;
                    
                    messagesContainer.appendChild(messageItem);
                });
            });
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

// Enable message input
function enableMessageInput() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-btn');
    
    if (messageInput && sendButton) {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Send message
function sendMessage() {
    if (!currentConversation) return;
    
    const messageInput = document.getElementById('message-input');
    
    if (messageInput && messageInput.value.trim()) {
        const messageText = messageInput.value.trim();
        
        // Clear input
        messageInput.value = '';
        
        // Send message
        API.messaging.sendMessage(currentConversation.id, { text: messageText })
            .then(message => {
                // Add message to UI
                addMessageToUI(message);
                
                // Refresh conversations list to update last message
                loadConversations();
            })
            .catch(error => {
                console.error('Error sending message:', error);
                
                // Show error
                showToast('Error sending message. Please try again.', 'error');
                
                // Restore message text
                messageInput.value = messageText;
            });
    }
}

// Add message to UI
function addMessageToUI(message) {
    const messagesContainer = document.querySelector('.messages');
    
    if (messagesContainer) {
        // Remove no messages placeholder if it exists
        const noMessages = messagesContainer.querySelector('.no-messages');
        if (noMessages) {
            noMessages.remove();
        }
        
        // Check if we need to add a new date separator
        const messageDate = formatDate(new Date(message.timestamp));
        const lastSeparator = messagesContainer.querySelector('.date-separator:last-child');
        
        if (!lastSeparator || lastSeparator.textContent !== messageDate) {
            const dateSeparator = document.createElement('div');
            dateSeparator.className = 'date-separator';
            dateSeparator.textContent = messageDate;
            messagesContainer.appendChild(dateSeparator);
        }
        
        // Create message item
        const messageItem = document.createElement('div');
        const currentUser = API.auth.getCurrentUser();
        const isCurrentUser = message.senderId === currentUser.id;
        
        messageItem.className = `message-item ${isCurrentUser ? 'sent' : 'received'}`;
        messageItem.dataset.id = message.id;
        
        messageItem.innerHTML = `
            <div class="message-content">
                <p class="message-text">${formatMessageText(message.text)}</p>
                <span class="message-time">${formatMessageTime(new Date(message.timestamp), true)}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageItem);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Start polling for new messages
function startMessagePolling(conversationId) {
    // Stop any existing polling
    stopMessagePolling();
    
    // Start new polling
    messagePollingInterval = setInterval(() => {
        if (!conversationId) return;
        
        API.messaging.getMessages(conversationId)
            .then(messages => {
                // Update messages if there are new ones
                const messagesContainer = document.querySelector('.messages');
                const messageItems = messagesContainer.querySelectorAll('.message-item');
                
                if (messages.length > messageItems.length) {
                    updateMessagesContainer(messages);
                    
                    // Refresh conversations list to update unread counts
                    loadConversations();
                }
            })
            .catch(error => {
                console.error('Error polling messages:', error);
            });
    }, 3000); // Poll every 3 seconds
}

// Stop message polling
function stopMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
        messagePollingInterval = null;
    }
}

// Start polling for online users
function startOnlineUsersPolling() {
    // Stop any existing polling
    if (onlineUsersPollingInterval) {
        clearInterval(onlineUsersPollingInterval);
    }
    
    // Update user's active status
    API.auth.updateActiveStatus();
    
    // Start new polling
    onlineUsersPollingInterval = setInterval(() => {
        // Update user's active status
        API.auth.updateActiveStatus();
        
        // If conversation is open, update online status
        if (currentConversation) {
            API.messaging.getConversations()
                .then(conversations => {
                    const updatedConversation = conversations.find(c => c.id === currentConversation.id);
                    
                    if (updatedConversation) {
                        // Update conversation header if online status changed
                        if (updatedConversation.otherParticipant.isOnline !== currentConversation.otherParticipant.isOnline) {
                            currentConversation = updatedConversation;
                            updateConversationHeader(currentConversation);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error updating online status:', error);
                });
        }
        
        // Update conversations list to refresh online indicators
        loadConversations();
    }, 30000); // Poll every 30 seconds
}

// Show new message modal
function showNewMessageModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('new-message-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'new-message-modal';
        modal.className = 'modal';
        
        document.body.appendChild(modal);
    }
    
    // Get users
    API.users.getAll()
        .then(users => {
            // Filter out current user
            const currentUser = API.auth.getCurrentUser();
            const filteredUsers = users.filter(user => user.id !== currentUser.id);
            
            // Update modal content
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>New Message</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="search-container">
                            <input type="text" id="modal-user-search" placeholder="Search users...">
                        </div>
                        <div class="users-list">
                            ${filteredUsers.map(user => `
                                <div class="user-item" data-id="${user.id}">
                                    <div class="user-avatar">
                                        <img src="${user.avatar}" alt="${user.name}">
                                        ${user.isOnline ? '<span class="online-indicator"></span>' : ''}
                                    </div>
                                    <div class="user-details">
                                        <h4 class="user-name">${user.name}</h4>
                                        <p class="user-role">${formatRole(user.role)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            // Show modal
            modal.style.display = 'block';
            
            // Focus search input
            setTimeout(() => {
                const searchInput = document.getElementById('modal-user-search');
                if (searchInput) searchInput.focus();
            }, 100);
            
            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', function() {
                modal.style.display = 'none';
            });
            
            // Add search functionality
            modal.querySelector('#modal-user-search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                filterUsers(searchTerm);
            });
            
            // Add click event to user items
            const userItems = modal.querySelectorAll('.user-item');
            userItems.forEach(item => {
                item.addEventListener('click', function() {
                    const userId = parseInt(this.dataset.id);
                    startConversation(userId);
                    modal.style.display = 'none';
                });
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

// Filter users in modal
function filterUsers(searchTerm) {
    const userItems = document.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const name = item.querySelector('.user-name').textContent.toLowerCase();
        const role = item.querySelector('.user-role').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || role.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Start conversation with user
function startConversation(userId) {
    const currentUser = API.auth.getCurrentUser();
    
    if (!currentUser) return;
    
    // Get or create conversation
    API.messaging.getOrCreateConversation(currentUser.id, userId)
        .then(conversation => {
            // Open messaging panel if not already open
            const panel = document.getElementById('messaging-panel');
            if (panel && panel.style.display !== 'block') {
                toggleMessagingPanel();
            }
            
            // Open conversation
            openConversation(conversation.id);
            
            // Refresh conversations list
            loadConversations();
        })
        .catch(error => {
            console.error('Error starting conversation:', error);
        });
}

// Update message badge
function updateMessageBadge() {
    const currentUser = API.auth.getCurrentUser();
    if (!currentUser) return;
    
    API.messaging.getConversations()
        .then(conversations => {
            // Count total unread messages
            const unreadCount = conversations.reduce((total, conversation) => {
                return total + conversation.unreadCount;
            }, 0);
            
            // Update badge
            const badge = document.querySelector('.messaging-btn .message-badge');
            
            if (badge) {
                badge.textContent = unreadCount;
                
                if (unreadCount > 0) {
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        })
        .catch(error => {
            console.error('Error updating message badge:', error);
        });
}

// Set up activity tracking
function setupActivityTracking() {
    // Update active status on user interaction
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
        document.addEventListener(event, debounce(() => {
            API.auth.updateActiveStatus();
        }, 5000)); // Debounce to avoid too many updates
    });
    
    // Update active status before page unload
    window.addEventListener('beforeunload', function() {
        API.auth.logout();
    });
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

// Format last active time
function formatLastActive(date) {
    const now = new Date();
    const diff = now - date;
    
    // If less than 1 minute
    if (diff < 60 * 1000) {
        return 'just now';
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
        day: 'numeric'
    });
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

// Add messaging styles
function addMessagingStyles() {
    // Check if styles already exist
    if (document.getElementById('messaging-styles')) {
        return;
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'messaging-styles';
    
    // Add CSS
    style.textContent = `
        /* Messaging Panel */
        .messaging-panel {
            position: fixed;
            top: 70px;
            right: 20px;
            width: 800px;
            height: 600px;
            background-color: white;
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .messaging-header {
            padding: var(--spacing-md) var(--spacing-lg);
            background-color: var(--theme-primary);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .messaging-header h3 {
            margin: 0;
            font-size: 1.2rem;
        }
        
        .close-panel {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
        }
        
        .messaging-content {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        /* Conversations List */
        .conversations-list {
            width: 300px;
            border-right: 1px solid var(--light-gray);
            display: flex;
            flex-direction: column;
        }
        
        .search-container {
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
            display: flex;
        }
        
        .search-container input {
            flex: 1;
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--medium-gray);
            border-radius: var(--border-radius-sm);
        }
        
        #new-message-btn {
            background-color: var(--theme-secondary);
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-left: var(--spacing-sm);
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .conversations {
            flex: 1;
            overflow-y: auto;
        }
        
        .no-conversations {
            padding: var(--spacing-lg);
            text-align: center;
            color: var(--dark-gray);
        }
        
        .no-conversations button {
            background-color: var(--theme-secondary);
            color: white;
            border: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius-sm);
            margin-top: var(--spacing-md);
            cursor: pointer;
        }
        
        .conversation-item {
            display: flex;
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
            cursor: pointer;
            transition: background-color 0.2s;
            position: relative;
        }
        
        .conversation-item:hover {
            background-color: rgba(var(--theme-secondary-rgb), 0.05);
        }
        
        .conversation-item.active {
            background-color: rgba(var(--theme-secondary-rgb), 0.1);
        }
        
        .conversation-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: var(--spacing-md);
            position: relative;
            overflow: hidden;
        }
        
        .conversation-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .online-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background-color: var(--success-color);
            border: 2px solid white;
            border-radius: 50%;
        }
        
        .conversation-details {
            flex: 1;
            min-width: 0; /* Allow text truncation */
        }
        
        .conversation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-xs);
        }
        
        .conversation-name {
            margin: 0;
            font-size: 1rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .conversation-time {
            font-size: 0.8rem;
            color: var(--dark-gray);
            white-space: nowrap;
        }
        
        .conversation-last-message {
            margin: 0;
            font-size: 0.9rem;
            color: var(--dark-gray);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .unread-badge {
            position: absolute;
            top: 50%;
            right: var(--spacing-md);
            transform: translateY(-50%);
            background-color: var(--theme-secondary);
            color: white;
            font-size: 0.7rem;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 var(--spacing-xs);
        }
        
        /* Conversation View */
        .conversation-view {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .conversation-header {
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
            background-color: white;
        }
        
        .conversation-info {
            display: flex;
            align-items: center;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: var(--spacing-md);
            overflow: hidden;
        }
        
        .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .user-details h4 {
            margin: 0;
            font-size: 1rem;
            margin-bottom: var(--spacing-xs);
        }
        
        .user-status {
            margin: 0;
            font-size: 0.8rem;
            color: var(--dark-gray);
            display: flex;
            align-items: center;
        }
        
        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: var(--spacing-xs);
        }
        
        .status-indicator.online {
            background-color: var(--success-color);
        }
        
        .status-indicator.offline {
            background-color: var(--dark-gray);
        }
        
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: var(--spacing-md);
            background-color: #f9f9f9;
        }
        
        .no-messages {
            text-align: center;
            padding: var(--spacing-xl) 0;
            color: var(--dark-gray);
        }
        
        .no-messages .hint {
            font-size: 0.9rem;
            margin-top: var(--spacing-sm);
            opacity: 0.7;
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
        
        .message-item {
            display: flex;
            margin-bottom: var(--spacing-md);
        }
        
        .message-item.sent {
            justify-content: flex-end;
        }
        
        .message-content {
            max-width: 70%;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius-md);
            position: relative;
        }
        
        .message-item.sent .message-content {
            background-color: var(--theme-secondary);
            color: white;
            border-top-right-radius: 0;
        }
        
        .message-item.received .message-content {
            background-color: white;
            border-top-left-radius: 0;
        }
        
        .message-text {
            margin: 0;
            word-wrap: break-word;
            white-space: pre-wrap;
        }
        
        .message-text a {
            color: inherit;
            text-decoration: underline;
        }
        
        .message-time {
            font-size: 0.7rem;
            margin-top: var(--spacing-xs);
            display: block;
            text-align: right;
            opacity: 0.8;
        }
        
        .message-input-container {
            display: flex;
            padding: var(--spacing-md);
            border-top: 1px solid var(--light-gray);
            background-color: white;
        }
        
        #message-input {
            flex: 1;
            padding: var(--spacing-sm) var(--spacing-md);
            border: 1px solid var(--medium-gray);
            border-radius: var(--border-radius-sm);
            resize: none;
            height: 40px;
            max-height: 120px;
        }
        
        #send-message-btn {
            background-color: var(--theme-secondary);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: var(--border-radius-sm);
            margin-left: var(--spacing-sm);
            cursor: pointer;
        }
        
        #send-message-btn:disabled {
            background-color: var(--medium-gray);
            cursor: not-allowed;
        }
        
        /* User Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1001;
        }
        
        .modal-content {
            background-color: white;
            margin: 10% auto;
            width: 90%;
            max-width: 500px;
            border-radius: var(--border-radius-md);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
        }
        
        .modal-header {
            padding: var(--spacing-md) var(--spacing-lg);
            background-color: var(--theme-primary);
            color: white;
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
            padding: var(--spacing-md);
            max-height: 400px;
            overflow-y: auto;
        }
        
        .users-list {
            margin-top: var(--spacing-md);
        }
        
        .user-item {
            display: flex;
            padding: var(--spacing-md);
            border-bottom: 1px solid var(--light-gray);
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .user-item:hover {
            background-color: rgba(var(--theme-secondary-rgb), 0.05);
        }
        
        .user-item:last-child {
            border-bottom: none;
        }
        
        .user-role {
            margin: 0;
            font-size: 0.8rem;
            color: var(--dark-gray);
        }
        
        /* Responsive Styles */
        @media (max-width: 900px) {
            .messaging-panel {
                width: 90%;
                height: 80%;
                top: 10%;
                right: 5%;
            }
        }
        
        @media (max-width: 768px) {
            .messaging-panel {
                width: 100%;
                height: 100%;
                top: 0;
                right: 0;
                border-radius: 0;
            }
            
            .conversations-list {
                width: 100%;
                display: none;
            }
            
            .conversation-view {
                width: 100%;
            }
            
            /* Show conversations list when no conversation is selected */
            .messaging-panel.show-list .conversations-list {
                display: flex;
            }
            
            .messaging-panel.show-list .conversation-view {
                display: none;
            }
            
            /* Add back button in conversation header */
            .conversation-header .back-btn {
                display: block;
            }
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
}