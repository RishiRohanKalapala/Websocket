/**
 * API Simulation for AImpact & AIdex
 * 
 * This file simulates backend API functionality using localStorage
 * In a real application, these functions would make AJAX calls to a server
 */

// Initialize data store if it doesn't exist
function initializeDataStore() {
    // Initialize users if not already done
    if (!localStorage.getItem('users')) {
        const users = [
            {
                id: 1,
                email: "admin@aimpact.com",
                password: "Admin@123",
                name: "Admin User",
                role: "admin",
                dashboard: "admin-dashboard.html",
                lastLogin: "2023-11-15T09:30:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Admin+User&background=2c3e50&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            },
            {
                id: 2,
                email: "dhanush@aimpact.com",
                password: "Dhanush@123",
                name: "Dhanush Reddy",
                role: "frontend",
                dashboard: "frontend-dashboard.html",
                lastLogin: "2023-11-14T14:45:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Dhanush+Reddy&background=2980b9&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            },
            {
                id: 3,
                email: "srestitha@aimpact.com",
                password: "Srestitha@123",
                name: "Srestitha Vemuri",
                role: "medical",
                dashboard: "medical-dashboard.html",
                lastLogin: "2023-11-13T11:20:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Srestitha+Vemuri&background=27ae60&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            },
            {
                id: 4,
                email: "naveen@aimpact.com",
                password: "Naveen@123",
                name: "Naveen Nunna",
                role: "designer",
                dashboard: "design-dashboard.html",
                lastLogin: "2023-11-15T08:15:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Naveen+Nunna&background=8e44ad&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            },
            {
                id: 5,
                email: "varshith@aimpact.com",
                password: "Varshith@123",
                name: "Varshith Goud",
                role: "java",
                dashboard: "java-dashboard.html",
                lastLogin: "2023-11-14T16:30:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Varshith+Goud&background=d35400&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            },
            {
                id: 6,
                email: "prajwal@aimpact.com",
                password: "Prajwal@123",
                name: "Prajwal",
                role: "database",
                dashboard: "database-dashboard.html",
                lastLogin: "2023-11-15T10:45:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Prajwal&background=16a085&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            },
            {
                id: 7,
                email: "geethika@aimpact.com",
                password: "Geethika@123",
                name: "Geethika Kalapala",
                role: "homeo",
                dashboard: "homeo-dashboard.html",
                lastLogin: "2023-11-13T09:10:00",
                lastActive: null,
                isOnline: false,
                avatar: "https://ui-avatars.com/api/?name=Geethika+Kalapala&background=2c3e50&color=fff",
                notifications: [],
                tasks: [],
                unreadMessages: 0
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Initialize notifications if not already done
    if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify([]));
    }
    
    // Initialize tasks if not already done
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify([]));
    }
    
    // Initialize conversations if not already done
    if (!localStorage.getItem('conversations')) {
        localStorage.setItem('conversations', JSON.stringify([]));
    }
    
    // Initialize messages if not already done
    if (!localStorage.getItem('messages')) {
        localStorage.setItem('messages', JSON.stringify([]));
    }
    
    // Initialize online users if not already done
    if (!localStorage.getItem('onlineUsers')) {
        localStorage.setItem('onlineUsers', JSON.stringify([]));
    }
}

// API Object
const API = {
    // Authentication
    auth: {
        // Login user
        login: function(email, password) {
            return new Promise((resolve, reject) => {
                // Simulate network delay
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users'));
                    const user = users.find(u => u.email === email && u.password === password);
                    
                    if (user) {
                        // Update last login time and online status
                        user.lastLogin = new Date().toISOString();
                        user.lastActive = new Date().toISOString();
                        user.isOnline = true;
                        
                        // Add to online users
                        const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers'));
                        if (!onlineUsers.includes(user.id)) {
                            onlineUsers.push(user.id);
                            localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
                        }
                        
                        localStorage.setItem('users', JSON.stringify(users));
                        
                        // Create session object (without password)
                        const session = {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            avatar: user.avatar,
                            lastLogin: user.lastLogin,
                            isOnline: user.isOnline
                        };
                        
                        resolve(session);
                    } else {
                        reject(new Error('Invalid email or password'));
                    }
                }, 800);
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
            
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].lastActive = new Date().toISOString();
                users[userIndex].isOnline = true;
                localStorage.setItem('users', JSON.stringify(users));
            }
        },
        
        // Logout user
        logout: function() {
            const currentUser = API.auth.getCurrentUser();
            if (currentUser) {
                // Update user's online status
                const users = JSON.parse(localStorage.getItem('users'));
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                
                if (userIndex !== -1) {
                    users[userIndex].isOnline = false;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                
                // Remove from online users
                const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers'));
                const updatedOnlineUsers = onlineUsers.filter(id => id !== currentUser.id);
                localStorage.setItem('onlineUsers', JSON.stringify(updatedOnlineUsers));
            }
            
            sessionStorage.removeItem('currentUser');
        }
    },
    
    // Users
    users: {
        // Get all users
        getAll: function() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users'));
                    // Return users without passwords
                    const safeUsers = users.map(user => {
                        const { password, ...safeUser } = user;
                        return safeUser;
                    });
                    resolve(safeUsers);
                }, 500);
            });
        },
        
        // Get user by ID
        getById: function(id) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users'));
                    const user = users.find(u => u.id === id);
                    
                    if (user) {
                        // Return user without password
                        const { password, ...safeUser } = user;
                        resolve(safeUser);
                    } else {
                        reject(new Error('User not found'));
                    }
                }, 300);
            });
        },
        
        // Get online users
        getOnlineUsers: function() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const onlineUserIds = JSON.parse(localStorage.getItem('onlineUsers'));
                    const users = JSON.parse(localStorage.getItem('users'));
                    
                    // Filter online users and remove passwords
                    const onlineUsers = users
                        .filter(user => onlineUserIds.includes(user.id))
                        .map(user => {
                            const { password, ...safeUser } = user;
                            return safeUser;
                        });
                    
                    resolve(onlineUsers);
                }, 300);
            });
        },
        
        // Update unread message count
        updateUnreadCount: function(userId, count) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('users'));
                    const userIndex = users.findIndex(u => u.id === userId);
                    
                    if (userIndex !== -1) {
                        users[userIndex].unreadMessages = count;
                        localStorage.setItem('users', JSON.stringify(users));
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }, 200);
            });
        }
    },
    
    // Notifications
    notifications: {
        // Send notification to users
        send: function(notification) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Get current notifications
                    const notifications = JSON.parse(localStorage.getItem('notifications'));
                    
                    // Add ID and timestamp to notification
                    const newNotification = {
                        id: Date.now(),
                        timestamp: new Date().toISOString(),
                        read: false,
                        ...notification
                    };
                    
                    // Add to notifications list
                    notifications.push(newNotification);
                    localStorage.setItem('notifications', JSON.stringify(notifications));
                    
                    // Add to each recipient's notifications
                    const users = JSON.parse(localStorage.getItem('users'));
                    users.forEach(user => {
                        // If notification is for all users or this specific user
                        if (notification.recipients === 'all' || 
                            (Array.isArray(notification.recipients) && notification.recipients.includes(user.id))) {
                            user.notifications.push(newNotification);
                        }
                    });
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    resolve(newNotification);
                }, 600);
            });
        },
        
        // Get notifications for current user
        getForCurrentUser: function() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        resolve([]);
                        return;
                    }
                    
                    const users = JSON.parse(localStorage.getItem('users'));
                    const user = users.find(u => u.id === currentUser.id);
                    
                    if (user) {
                        resolve(user.notifications);
                    } else {
                        resolve([]);
                    }
                }, 300);
            });
        },
        
        // Mark notification as read
        markAsRead: function(notificationId) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        resolve(false);
                        return;
                    }
                    
                    const users = JSON.parse(localStorage.getItem('users'));
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    
                    if (userIndex !== -1) {
                        const notificationIndex = users[userIndex].notifications.findIndex(n => n.id === notificationId);
                        
                        if (notificationIndex !== -1) {
                            users[userIndex].notifications[notificationIndex].read = true;
                            localStorage.setItem('users', JSON.stringify(users));
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                }, 300);
            });
        }
    },
    
    // Tasks
    tasks: {
        // Assign task to users
        assign: function(task) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Get current tasks
                    const tasks = JSON.parse(localStorage.getItem('tasks'));
                    
                    // Add ID and timestamp to task
                    const newTask = {
                        id: Date.now(),
                        createdAt: new Date().toISOString(),
                        completed: false,
                        ...task
                    };
                    
                    // Add to tasks list
                    tasks.push(newTask);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    
                    // Add to each assignee's tasks
                    const users = JSON.parse(localStorage.getItem('users'));
                    users.forEach(user => {
                        // If task is assigned to this user
                        if (Array.isArray(task.assignees) && task.assignees.includes(user.id)) {
                            user.tasks.push(newTask);
                        }
                    });
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    resolve(newTask);
                }, 600);
            });
        },
        
        // Get tasks for current user
        getForCurrentUser: function() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        resolve([]);
                        return;
                    }
                    
                    const users = JSON.parse(localStorage.getItem('users'));
                    const user = users.find(u => u.id === currentUser.id);
                    
                    if (user) {
                        resolve(user.tasks);
                    } else {
                        resolve([]);
                    }
                }, 300);
            });
        },
        
        // Update task status
        updateStatus: function(taskId, completed) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        resolve(false);
                        return;
                    }
                    
                    // Update in main tasks list
                    const tasks = JSON.parse(localStorage.getItem('tasks'));
                    const taskIndex = tasks.findIndex(t => t.id === taskId);
                    
                    if (taskIndex !== -1) {
                        tasks[taskIndex].completed = completed;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                    }
                    
                    // Update in user's tasks list
                    const users = JSON.parse(localStorage.getItem('users'));
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    
                    if (userIndex !== -1) {
                        const userTaskIndex = users[userIndex].tasks.findIndex(t => t.id === taskId);
                        
                        if (userTaskIndex !== -1) {
                            users[userIndex].tasks[userTaskIndex].completed = completed;
                            localStorage.setItem('users', JSON.stringify(users));
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                }, 300);
            });
        }
    },
    
    // Messaging
    messaging: {
        // Get or create conversation between users
        getOrCreateConversation: function(userId1, userId2) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!userId1 || !userId2) {
                        reject(new Error('Both user IDs are required'));
                        return;
                    }
                    
                    // Sort user IDs to ensure consistent conversation ID
                    const participants = [userId1, userId2].sort((a, b) => a - b);
                    
                    // Get conversations
                    const conversations = JSON.parse(localStorage.getItem('conversations'));
                    
                    // Check if conversation already exists
                    let conversation = conversations.find(c => 
                        c.participants.length === 2 && 
                        c.participants.includes(participants[0]) && 
                        c.participants.includes(participants[1])
                    );
                    
                    if (!conversation) {
                        // Create new conversation
                        conversation = {
                            id: Date.now(),
                            participants: participants,
                            createdAt: new Date().toISOString(),
                            lastMessageAt: new Date().toISOString()
                        };
                        
                        conversations.push(conversation);
                        localStorage.setItem('conversations', JSON.stringify(conversations));
                    }
                    
                    resolve(conversation);
                }, 300);
            });
        },
        
        // Get conversations for current user
        getConversations: function() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        resolve([]);
                        return;
                    }
                    
                    // Get conversations
                    const conversations = JSON.parse(localStorage.getItem('conversations'));
                    const userConversations = conversations.filter(c => 
                        c.participants.includes(currentUser.id)
                    );
                    
                    // Get users for participant info
                    const users = JSON.parse(localStorage.getItem('users'));
                    
                    // Get messages for last message
                    const messages = JSON.parse(localStorage.getItem('messages'));
                    
                    // Enhance conversations with participant info and last message
                    const enhancedConversations = userConversations.map(conversation => {
                        // Get other participant
                        const otherParticipantId = conversation.participants.find(id => id !== currentUser.id);
                        const otherParticipant = users.find(u => u.id === otherParticipantId);
                        
                        // Get last message
                        const conversationMessages = messages.filter(m => m.conversationId === conversation.id);
                        const lastMessage = conversationMessages.length > 0 
                            ? conversationMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                            : null;
                        
                        // Count unread messages
                        const unreadCount = conversationMessages.filter(m => 
                            !m.read && m.senderId !== currentUser.id
                        ).length;
                        
                        return {
                            ...conversation,
                            otherParticipant: otherParticipant ? {
                                id: otherParticipant.id,
                                name: otherParticipant.name,
                                avatar: otherParticipant.avatar,
                                isOnline: otherParticipant.isOnline,
                                lastActive: otherParticipant.lastActive
                            } : null,
                            lastMessage: lastMessage,
                            unreadCount: unreadCount
                        };
                    });
                    
                    // Sort by last message time (newest first)
                    enhancedConversations.sort((a, b) => {
                        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.lastMessageAt);
                        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.lastMessageAt);
                        return bTime - aTime;
                    });
                    
                    resolve(enhancedConversations);
                }, 300);
            });
        },
        
        // Get messages for a conversation
        getMessages: function(conversationId) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!conversationId) {
                        reject(new Error('Conversation ID is required'));
                        return;
                    }
                    
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        resolve([]);
                        return;
                    }
                    
                    // Get conversations
                    const conversations = JSON.parse(localStorage.getItem('conversations'));
                    const conversation = conversations.find(c => c.id === conversationId);
                    
                    if (!conversation) {
                        reject(new Error('Conversation not found'));
                        return;
                    }
                    
                    // Check if user is participant
                    if (!conversation.participants.includes(currentUser.id)) {
                        reject(new Error('User is not a participant in this conversation'));
                        return;
                    }
                    
                    // Get messages
                    const messages = JSON.parse(localStorage.getItem('messages'));
                    const conversationMessages = messages.filter(m => m.conversationId === conversationId);
                    
                    // Sort by timestamp (oldest first)
                    conversationMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    
                    // Mark messages as read
                    const updatedMessages = messages.map(message => {
                        if (message.conversationId === conversationId && 
                            message.senderId !== currentUser.id && 
                            !message.read) {
                            return { ...message, read: true };
                        }
                        return message;
                    });
                    
                    localStorage.setItem('messages', JSON.stringify(updatedMessages));
                    
                    // Update user's unread count
                    const users = JSON.parse(localStorage.getItem('users'));
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    
                    if (userIndex !== -1) {
                        // Count all unread messages for user
                        const allMessages = JSON.parse(localStorage.getItem('messages'));
                        const unreadCount = allMessages.filter(m => 
                            m.recipientId === currentUser.id && !m.read
                        ).length;
                        
                        users[userIndex].unreadMessages = unreadCount;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    
                    resolve(conversationMessages);
                }, 300);
            });
        },
        
        // Send a message
        sendMessage: function(conversationId, message) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('User not authenticated'));
                        return;
                    }
                    
                    if (!conversationId) {
                        reject(new Error('Conversation ID is required'));
                        return;
                    }
                    
                    if (!message || !message.text) {
                        reject(new Error('Message text is required'));
                        return;
                    }
                    
                    // Get conversations
                    const conversations = JSON.parse(localStorage.getItem('conversations'));
                    const conversation = conversations.find(c => c.id === conversationId);
                    
                    if (!conversation) {
                        reject(new Error('Conversation not found'));
                        return;
                    }
                    
                    // Check if user is participant
                    if (!conversation.participants.includes(currentUser.id)) {
                        reject(new Error('User is not a participant in this conversation'));
                        return;
                    }
                    
                    // Get recipient ID
                    const recipientId = conversation.participants.find(id => id !== currentUser.id);
                    
                    // Create new message
                    const newMessage = {
                        id: Date.now(),
                        conversationId: conversationId,
                        senderId: currentUser.id,
                        recipientId: recipientId,
                        text: message.text,
                        timestamp: new Date().toISOString(),
                        read: false
                    };
                    
                    // Add to messages
                    const messages = JSON.parse(localStorage.getItem('messages'));
                    messages.push(newMessage);
                    localStorage.setItem('messages', JSON.stringify(messages));
                    
                    // Update conversation last message time
                    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
                    conversations[conversationIndex].lastMessageAt = newMessage.timestamp;
                    localStorage.setItem('conversations', JSON.stringify(conversations));
                    
                    // Update recipient's unread count
                    const users = JSON.parse(localStorage.getItem('users'));
                    const recipientIndex = users.findIndex(u => u.id === recipientId);
                    
                    if (recipientIndex !== -1) {
                        // Count unread messages for recipient
                        const unreadCount = messages.filter(m => 
                            m.recipientId === recipientId && !m.read
                        ).length;
                        
                        users[recipientIndex].unreadMessages = unreadCount;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    
                    resolve(newMessage);
                }, 300);
            });
        },
        
        // Get all conversations (admin only)
        getAllConversations: function() {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const currentUser = API.auth.getCurrentUser();
                    if (!currentUser) {
                        reject(new Error('User not authenticated'));
                        return;
                    }
                    
                    // Check if user is admin
                    if (currentUser.role !== 'admin') {
                        reject(new Error('Only admin can access all conversations'));
                        return;
                    }
                    
                    // Get conversations
                    const conversations = JSON.parse(localStorage.getItem('conversations'));
                    
                    // Get users for participant info
                    const users = JSON.parse(localStorage.getItem('users'));
                    
                    // Get messages for last message
                    const messages = JSON.parse(localStorage.getItem('messages'));
                    
                    // Enhance conversations with participant info and last message
                    const enhancedConversations = conversations.map(conversation => {
                        // Get participants
                        const participants = conversation.participants.map(id => {
                            const user = users.find(u => u.id === id);
                            return user ? {
                                id: user.id,
                                name: user.name,
                                avatar: user.avatar,
                                isOnline: user.isOnline,
                                role: user.role
                            } : null;
                        }).filter(p => p !== null);
                        
                        // Get last message
                        const conversationMessages = messages.filter(m => m.conversationId === conversation.id);
                        const lastMessage = conversationMessages.length > 0 
                            ? conversationMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
                            : null;
                        
                        // Count messages
                        const messageCount = conversationMessages.length;
                        
                        return {
                            ...conversation,
                            participants: participants,
                            lastMessage: lastMessage,
                            messageCount: messageCount
                        };
                    });
                    
                    // Sort by last message time (newest first)
                    enhancedConversations.sort((a, b) => {
                        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(a.lastMessageAt);
                        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(b.lastMessageAt);
                        return bTime - aTime;
                    });
                    
                    resolve(enhancedConversations);
                }, 300);
            });
        }
    }
};

// Initialize data store when script loads
initializeDataStore();

// Export API
window.API = API;