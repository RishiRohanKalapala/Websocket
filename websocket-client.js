/**
 * WebSocket Client for AImpact & AIdex
 * Handles real-time messaging and notifications using WebSockets
 */

// WebSocket connection
let stompClient = null;
let isConnected = false;
let reconnectInterval = null;
let userId = null;

// Initialize WebSocket connection
function initializeWebSocket(currentUserId) {
    userId = currentUserId;
    
    // Connect to WebSocket server
    connectWebSocket();
    
    // Set up reconnection on window focus
    window.addEventListener('focus', function() {
        if (!isConnected) {
            connectWebSocket();
        }
    });
    
    // Set up disconnection on window blur
    window.addEventListener('blur', function() {
        // Keep connection alive even when window is not in focus
        // This ensures messages are still received
    });
    
    // Set up reconnection on network status change
    window.addEventListener('online', function() {
        if (!isConnected) {
            connectWebSocket();
        }
    });
    
    // Handle disconnection on network status change
    window.addEventListener('offline', function() {
        disconnectWebSocket();
    });
    
    // Handle disconnection on page unload
    window.addEventListener('beforeunload', function() {
        disconnectWebSocket();
    });
}

// Connect to WebSocket server
function connectWebSocket() {
    if (isConnected || !userId) return;
    
    // Clear any existing reconnect interval
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
    
    // Create SockJS connection
    const socket = new SockJS('http://localhost:8080/ws?userId=' + userId);
    stompClient = Stomp.over(socket);
    
    // Disable debug logging
    stompClient.debug = null;
    
    // Connect to server
    stompClient.connect({}, function(frame) {
        isConnected = true;
        console.log('Connected to WebSocket server');
        
        // Subscribe to user-specific message channel
        stompClient.subscribe('/user/' + userId + '/queue/messages', onMessageReceived);
        
        // Subscribe to user-specific notification channel
        stompClient.subscribe('/user/' + userId + '/queue/notifications', onNotificationReceived);
        
        // Update user's online status
        updateUserStatus(true);
        
        // Notify listeners that connection is established
        document.dispatchEvent(new CustomEvent('websocket-connected'));
    }, function(error) {
        isConnected = false;
        console.error('Error connecting to WebSocket server:', error);
        
        // Set up reconnection
        if (!reconnectInterval) {
            reconnectInterval = setInterval(function() {
                connectWebSocket();
            }, 5000); // Try to reconnect every 5 seconds
        }
    });
}

// Disconnect from WebSocket server
function disconnectWebSocket() {
    if (!isConnected || !stompClient) return;
    
    // Update user's online status
    updateUserStatus(false);
    
    // Disconnect from server
    stompClient.disconnect(function() {
        isConnected = false;
        console.log('Disconnected from WebSocket server');
    });
}

// Update user's online status
function updateUserStatus(isOnline) {
    if (!userId) return;
    
    fetch('http://localhost:8080/api/users/' + userId + '/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isOnline: isOnline })
    }).catch(error => {
        console.error('Error updating user status:', error);
    });
}

// Update user's activity timestamp
function updateUserActivity() {
    if (!userId) return;
    
    fetch('http://localhost:8080/api/users/' + userId + '/activity', {
        method: 'POST'
    }).catch(error => {
        console.error('Error updating user activity:', error);
    });
}

// Send message via WebSocket
function sendMessage(conversationId, recipientId, text) {
    if (!isConnected || !stompClient) {
        console.error('Not connected to WebSocket server');
        return Promise.reject('Not connected to WebSocket server');
    }
    
    return new Promise((resolve, reject) => {
        try {
            stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({
                conversationId: conversationId,
                recipientId: recipientId,
                text: text
            }));
            
            // Resolve immediately, as we don't wait for a response
            resolve();
        } catch (error) {
            console.error('Error sending message:', error);
            reject(error);
        }
    });
}

// Send notification via WebSocket
function sendNotification(title, message, type, recipientIds) {
    if (!isConnected || !stompClient) {
        console.error('Not connected to WebSocket server');
        return Promise.reject('Not connected to WebSocket server');
    }
    
    return new Promise((resolve, reject) => {
        try {
            stompClient.send('/app/notification.send', {}, JSON.stringify({
                title: title,
                message: message,
                type: type,
                recipientIds: recipientIds
            }));
            
            // Resolve immediately, as we don't wait for a response
            resolve();
        } catch (error) {
            console.error('Error sending notification:', error);
            reject(error);
        }
    });
}

// Send notification to all users via WebSocket
function sendNotificationToAll(title, message, type) {
    if (!isConnected || !stompClient) {
        console.error('Not connected to WebSocket server');
        return Promise.reject('Not connected to WebSocket server');
    }
    
    return new Promise((resolve, reject) => {
        try {
            stompClient.send('/app/notification.sendToAll', {}, JSON.stringify({
                title: title,
                message: message,
                type: type
            }));
            
            // Resolve immediately, as we don't wait for a response
            resolve();
        } catch (error) {
            console.error('Error sending notification to all:', error);
            reject(error);
        }
    });
}

// Handle received message
function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    
    // Dispatch event with message data
    document.dispatchEvent(new CustomEvent('message-received', {
        detail: message
    }));
    
    // Update unread message count
    updateUnreadMessageCount();
}

// Handle received notification
function onNotificationReceived(payload) {
    const notification = JSON.parse(payload.body);
    
    // Dispatch event with notification data
    document.dispatchEvent(new CustomEvent('notification-received', {
        detail: notification
    }));
    
    // Update unread notification count
    updateUnreadNotificationCount();
    
    // Show notification toast
    showNotificationToast(notification);
}

// Update unread message count
function updateUnreadMessageCount() {
    if (!userId) return;
    
    fetch('http://localhost:8080/api/messages/unread/count?userId=' + userId)
        .then(response => response.json())
        .then(count => {
            // Dispatch event with unread count
            document.dispatchEvent(new CustomEvent('unread-messages-updated', {
                detail: { count: count }
            }));
        })
        .catch(error => {
            console.error('Error getting unread message count:', error);
        });
}

// Update unread notification count
function updateUnreadNotificationCount() {
    if (!userId) return;
    
    fetch('http://localhost:8080/api/notifications/unread/count?userId=' + userId)
        .then(response => response.json())
        .then(count => {
            // Dispatch event with unread count
            document.dispatchEvent(new CustomEvent('unread-notifications-updated', {
                detail: { count: count }
            }));
        })
        .catch(error => {
            console.error('Error getting unread notification count:', error);
        });
}

// Show notification toast
function showNotificationToast(notification) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${notification.type || 'info'}`;
    
    toast.innerHTML = `
        <div class="toast-header">
            <strong>${notification.title}</strong>
            <button class="close-toast">&times;</button>
        </div>
        <div class="toast-body">
            ${notification.message}
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Add close event
    toast.querySelector('.close-toast').addEventListener('click', function() {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// WebSocket API for external use
const WebSocketAPI = {
    initialize: initializeWebSocket,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    sendMessage: sendMessage,
    sendNotification: sendNotification,
    sendNotificationToAll: sendNotificationToAll,
    updateActivity: updateUserActivity,
    isConnected: () => isConnected
};