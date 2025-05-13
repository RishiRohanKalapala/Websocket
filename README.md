# AImpact & AIdex Dashboard System

A comprehensive role-based dashboard system with authentication, notifications, task management, and real-time messaging.

## Features

- **Secure Authentication System**
  - Role-based access control
  - Remember me functionality
  - Password visibility toggle

- **Admin Dashboard**
  - User management
  - Send alerts to individual users or all users
  - Assign tasks to individual or multiple users
  - System monitoring
  - Access to all user conversations

- **Role-Based Dashboards**
  - Customized dashboards for different user roles
  - Real-time notifications
  - Task management
  - Role-specific metrics and tools

- **Notification System**
  - Real-time alerts from admin
  - Unread notification indicators
  - Notification history

- **Task Management**
  - Task assignment from admin
  - Due date tracking
  - Priority levels
  - Task completion tracking
  
- **Real-Time Messaging System**
  - User-to-user private messaging
  - Online status indicators
  - Unread message counters
  - Message history
  - Admin monitoring of all conversations

## User Roles & Dashboards

1. **Admin** - System administration dashboard
2. **Frontend Developer** (Dhanush Reddy) - Frontend development tools and metrics
3. **Medical Advisor** (Srestitha Vemuri) - Patient management and medical analytics
4. **Designer** (Naveen Nunna) - Design projects and assets management
5. **Java Developer** (Varshith Goud) - Backend development tools and code metrics
6. **Database & Auth** (Prajwal) - Database monitoring and authentication management
7. **Homeo Advisor** (Geethika Kalapala) - Homeopathy patient management and remedies

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aimpact.com | Admin@123 |
| Frontend Developer | dhanush@aimpact.com | Dhanush@123 |
| Medical Advisor | srestitha@aimpact.com | Srestitha@123 |
| Designer | naveen@aimpact.com | Naveen@123 |
| Java Developer | varshith@aimpact.com | Varshith@123 |
| Database & Auth | prajwal@aimpact.com | Prajwal@123 |
| Homeo Advisor | geethika@aimpact.com | Geethika@123 |

## Technical Implementation

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design for all screen sizes
- Interactive charts and data visualization
- FontAwesome icons

### Backend Simulation
- LocalStorage API for data persistence
- Promise-based API simulation
- Role-based access control

### Files Structure
- `index.html` - Login page
- `login.js` - Authentication logic
- `api.js` - Backend API simulation
- `dashboard-styles.css` - Shared dashboard styles
- `dashboard.js` - Shared dashboard functionality
- `admin.js` - Admin-specific functionality
- `notifications.js` - Notification system
- Role-specific dashboard HTML files

## How to Use

1. Open `index.html` in a web browser
2. Log in with any of the credentials above
3. Explore the role-specific dashboard
4. Admin can send alerts and assign tasks to users
5. Users will receive notifications and tasks in real-time

## Admin Features

### Sending Alerts
1. Log in as admin (admin@aimpact.com / Admin@123)
2. Click the bullhorn icon in the header to send an alert to all users
3. Or click the bell icon next to a specific user to send an alert to that user only
4. Fill in the alert details and click "Send Alert"

### Assigning Tasks
1. Log in as admin
2. Click "Assign Task" in the User Management card to assign a task to multiple users
3. Or click the task icon next to a specific user to assign a task to that user only
4. Fill in the task details and click "Assign Task"

## User Features

### Notifications
- Users will see a badge with the number of unread notifications
- Click the bell icon to view notifications
- Click on a notification to mark it as read

### Tasks
- Users will see their assigned tasks in the "Upcoming Tasks" section
- Check the checkbox to mark a task as completed
- Tasks are sorted by due date

### Messaging
- Click the message icon in the header to open the messaging panel
- See online status of other users in real-time
- Start new conversations with any user
- Receive notifications for new messages
- Messages are saved and can be viewed later
- Admin can monitor all conversations between users