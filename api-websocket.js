/**
 * API Client for AImpact & AIdex
 * 
 * This file provides API functionality using REST and WebSockets
 * It communicates with the Java backend server
 */

// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// API Object
const API = {
    // Authentication
    auth: {
        // Login user
        login: function(email, password) {
            return fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid email or password');
                }
                return response.json();
            })
            .then(user => {
                // Store user in session storage
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                // Initialize WebSocket connection
                WebSocketAPI.initialize(user.id);
                
                return user;
            });
        },
        
        // Get current user
        getCurrentUser: function() {
            return JSON.parse(sessionStorage.getItem('currentUser'));
        },
        
        // Update user's active status
        updateActiveStatus: function() {
            const currentUser = API.auth.getCurrentUser();
            if (!currentUser) return;
            
            // Update activity via WebSocket
            WebSocketAPI.updateActivity();
        },
        
        // Logout user
        logout: function() {
            const currentUser = API.auth.getCurrentUser();
            if (currentUser) {
                // Disconnect WebSocket
                WebSocketAPI.disconnect();
                
                // Call logout endpoint
                fetch(`${API_BASE_URL}/users/${currentUser.id}/logout`, {
                    method: 'POST'
                }).catch(error => {
                    console.error('Error logging out:', error);
                });
            }
            
            sessionStorage.removeItem('currentUser');
        }
    },
    
    // Users
    users: {
        // Get all users
        getAll: function() {
            return fetch(`${API_BASE_URL}/users`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch users');
                    }
                    return response.json();
                });
        },
        
        // Get user by ID
        getById: function(id) {
            return fetch(`${API_BASE_URL}/users/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('User not found');
                    }
                    return response.json();
                });
        },
        
        // Get online users
        getOnlineUsers: function() {
            return fetch(`${API_BASE_URL}/users/online`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch online users');
                    }
                    return response.json();
                });
        }
    },
    
    // Notifications
    notifications: {
        // Send notification to users
        send: function(notification) {
            // Use WebSocket for real-time notifications
            return WebSocketAPI.sendNotification(
                notification.title,
                notification.message,
                notification.type,
                notification.recipients
            ).then(() => {
                // Return a placeholder notification object
                return {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    read: false,
                    ...notification
                };
            });
        },
        
        // Send notification to all users
        sendToAll: function(notification) {
            // Use WebSocket for real-time notifications
            return WebSocketAPI.sendNotificationToAll(
                notification.title,
                notification.message,
                notification.type
            ).then(() => {
                // Return a placeholder notification object
                return {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    read: false,
                    ...notification
                };
            });
        },
        
        // Get notifications for user
        getForUser: function(userId) {
            return fetch(`${API_BASE_URL}/notifications?userId=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch notifications');
                    }
                    return response.json();
                });
        },
        
        // Get unread notifications for user
        getUnreadForUser: function(userId) {
            return fetch(`${API_BASE_URL}/notifications/unread?userId=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch unread notifications');
                    }
                    return response.json();
                });
        },
        
        // Mark notification as read
        markAsRead: function(notificationId, userId) {
            return fetch(`${API_BASE_URL}/notifications/${notificationId}/read?userId=${userId}`, {
                method: 'POST'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to mark notification as read');
                }
                return response.json();
            });
        },
        
        // Get unread notification count
        getUnreadCount: function(userId) {
            return fetch(`${API_BASE_URL}/notifications/unread/count?userId=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch unread notification count');
                    }
                    return response.json();
                });
        }
    },
    
    // Tasks
    tasks: {
        // Assign task to user
        assign: function(task) {
            return fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to assign task');
                }
                return response.json();
            });
        },
        
        // Get tasks for user
        getForUser: function(userId) {
            return fetch(`${API_BASE_URL}/tasks?userId=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch tasks');
                    }
                    return response.json();
                });
        },
        
        // Mark task as completed
        markAsCompleted: function(taskId, completed) {
            return fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update task');
                }
                return response.json();
            });
        }
    },
    
    // Messaging
    messaging: {
        // Get conversations for user
        getConversations: function() {
            const currentUser = API.auth.getCurrentUser();
            if (!currentUser) return Promise.reject('User not logged in');
            
            return fetch(`${API_BASE_URL}/conversations?userId=${currentUser.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch conversations');
                    }
                    return response.json();
                });
        },
        
        // Get all conversations (admin only)
        getAllConversations: function() {
            const currentUser = API.auth.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                return Promise.reject('Unauthorized');
            }
            
            return fetch(`${API_BASE_URL}/conversations/all`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch all conversations');
                    }
                    return response.json();
                });
        },
        
        // Get or create conversation between two users
        getOrCreateConversation: function(userId1, userId2) {
            return fetch(`${API_BASE_URL}/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId1, userId2 })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create conversation');
                }
                return response.json();
            });
        },
        
        // Get messages for conversation
        getMessages: function(conversationId) {
            const currentUser = API.auth.getCurrentUser();
            if (!currentUser) return Promise.reject('User not logged in');
            
            return fetch(`${API_BASE_URL}/messages/conversation/${conversationId}?userId=${currentUser.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch messages');
                    }
                    return response.json();
                });
        },
        
        // Send message
        sendMessage: function(conversationId, message) {
            const currentUser = API.auth.getCurrentUser();
            if (!currentUser) return Promise.reject('User not logged in');
            
            // Find the other participant in the conversation
            return API.messaging.getConversations()
                .then(conversations => {
                    const conversation = conversations.find(c => c.id === conversationId);
                    if (!conversation) {
                        throw new Error('Conversation not found');
                    }
                    
                    // Get the other participant
                    const otherParticipant = conversation.participants[0];
                    
                    // Send message via WebSocket
                    return WebSocketAPI.sendMessage(
                        conversationId,
                        otherParticipant.id,
                        message.text
                    ).then(() => {
                        // Return a placeholder message object
                        return {
                            id: Date.now(),
                            conversationId: conversationId,
                            senderId: currentUser.id,
                            recipientId: otherParticipant.id,
                            text: message.text,
                            timestamp: new Date().toISOString(),
                            read: false
                        };
                    });
                });
        },
        
        // Mark messages as read
        markMessagesAsRead: function(conversationId) {
            const currentUser = API.auth.getCurrentUser();
            if (!currentUser) return Promise.reject('User not logged in');
            
            return fetch(`${API_BASE_URL}/messages/read/conversation/${conversationId}?userId=${currentUser.id}`, {
                method: 'POST'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to mark messages as read');
                }
                return true;
            });
        }
    }
};

// Initialize event listeners for WebSocket events
document.addEventListener('DOMContentLoaded', function() {
    // Listen for message received events
    document.addEventListener('message-received', function(event) {
        const message = event.detail;
        
        // If the message is for the current conversation, add it to the UI
        const currentConversation = document.querySelector('.conversation-item.active');
        if (currentConversation && currentConversation.dataset.id == message.conversationId) {
            // Add message to UI
            if (typeof addMessageToUI === 'function') {
                addMessageToUI(message);
            }
            
            // Mark message as read
            API.messaging.markMessagesAsRead(message.conversationId);
        }
    });
    
    // Listen for notification received events
    document.addEventListener('notification-received', function(event) {
        const notification = event.detail;
        
        // Update notification badge
        if (typeof updateNotificationBadge === 'function') {
            updateNotificationBadge();
        }
    });
    
    // Listen for unread messages updated events
    document.addEventListener('unread-messages-updated', function(event) {
        const { count } = event.detail;
        
        // Update message badge
        if (typeof updateMessageBadge === 'function') {
            updateMessageBadge();
        }
    });
    
    // Listen for unread notifications updated events
    document.addEventListener('unread-notifications-updated', function(event) {
        const { count } = event.detail;
        
        // Update notification badge
        if (typeof updateNotificationBadge === 'function') {
            updateNotificationBadge();
        }
    });
    
    // Listen for WebSocket connected events
    document.addEventListener('websocket-connected', function() {
        console.log('WebSocket connected');
        
        // Refresh data that might have changed while disconnected
        const currentUser = API.auth.getCurrentUser();
        if (currentUser) {
            // Refresh conversations
            if (typeof loadConversations === 'function') {
                loadConversations();
            }
            
            // Refresh notifications
            if (typeof loadNotifications === 'function') {
                loadNotifications();
            }
        }
    });
});

// Initialize data store
initializeDataStore();

// Function to initialize data store
function initializeDataStore() {
    // Nothing to initialize for the real API
    console.log('API client initialized');
}