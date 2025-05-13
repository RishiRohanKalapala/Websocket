# AImpact & AIdex WebSocket Messaging Deployment Guide

This guide explains how to deploy the real-time messaging system for AImpact & AIdex using WebSockets.

## Overview

The messaging system consists of two parts:
1. A Java-based Spring Boot WebSocket server
2. JavaScript client code that connects to the WebSocket server

## Server Deployment

### Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- A server with at least 1GB RAM (e.g., AWS EC2, DigitalOcean Droplet)

### Building the Server

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Build the application:
   ```
   mvn clean package
   ```

3. The built JAR file will be in the `target` directory:
   ```
   target/messaging-server-0.0.1-SNAPSHOT.jar
   ```

### Deploying to a Server

#### Option 1: Direct Deployment

1. Copy the JAR file to your server:
   ```
   scp target/messaging-server-0.0.1-SNAPSHOT.jar user@your-server:/path/to/deployment/
   ```

2. SSH into your server:
   ```
   ssh user@your-server
   ```

3. Run the application:
   ```
   java -jar /path/to/deployment/messaging-server-0.0.1-SNAPSHOT.jar
   ```

4. For production, use a process manager like systemd to keep the application running:
   
   Create a systemd service file:
   ```
   sudo nano /etc/systemd/system/messaging-server.service
   ```

   Add the following content:
   ```
   [Unit]
   Description=AImpact & AIdex Messaging Server
   After=network.target

   [Service]
   User=your-user
   WorkingDirectory=/path/to/deployment
   ExecStart=/usr/bin/java -jar /path/to/deployment/messaging-server-0.0.1-SNAPSHOT.jar
   SuccessExitStatus=143
   TimeoutStopSec=10
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start the service:
   ```
   sudo systemctl enable messaging-server.service
   sudo systemctl start messaging-server.service
   ```

#### Option 2: Docker Deployment

1. Create a Dockerfile in the server directory:
   ```
   FROM openjdk:11-jre-slim
   VOLUME /tmp
   COPY target/messaging-server-0.0.1-SNAPSHOT.jar app.jar
   ENTRYPOINT ["java","-jar","/app.jar"]
   ```

2. Build the Docker image:
   ```
   docker build -t aimpact/messaging-server .
   ```

3. Run the Docker container:
   ```
   docker run -d -p 8080:8080 --name messaging-server aimpact/messaging-server
   ```

#### Option 3: Cloud Deployment

For AWS Elastic Beanstalk:

1. Install the EB CLI:
   ```
   pip install awsebcli
   ```

2. Initialize EB CLI:
   ```
   eb init
   ```

3. Create an environment:
   ```
   eb create messaging-server-env
   ```

4. Deploy the application:
   ```
   eb deploy
   ```

## Client Deployment

### Updating the Client Code

1. Replace the existing API.js with api-websocket.js:
   ```
   mv api-websocket.js api.js
   ```

2. Replace the existing messaging.js with messaging-websocket.js:
   ```
   mv messaging-websocket.js messaging.js
   ```

3. Add the WebSocket client library to all HTML files:
   
   Add these lines before the API.js script:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/stomp-websocket@2.3.4-next/lib/stomp.min.js"></script>
   <script src="websocket-client.js"></script>
   ```

### Configuring the WebSocket URL

1. Update the WebSocket URL in websocket-client.js to point to your deployed server:
   
   Change:
   ```javascript
   const socket = new SockJS('http://localhost:8080/ws?userId=' + userId);
   ```
   
   To:
   ```javascript
   const socket = new SockJS('https://your-server-domain.com/ws?userId=' + userId);
   ```

2. Update the API base URL in api-websocket.js:
   
   Change:
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```
   
   To:
   ```javascript
   const API_BASE_URL = 'https://your-server-domain.com/api';
   ```

## Setting Up HTTPS

For production, you should use HTTPS for both the WebSocket connection and the REST API.

### Option 1: Using Nginx as a Reverse Proxy

1. Install Nginx:
   ```
   sudo apt update
   sudo apt install nginx
   ```

2. Install Certbot for Let's Encrypt SSL:
   ```
   sudo apt install certbot python3-certbot-nginx
   ```

3. Configure Nginx:
   ```
   sudo nano /etc/nginx/sites-available/messaging-server
   ```

   Add the following content:
   ```
   server {
       listen 80;
       server_name your-server-domain.com;

       location / {
           return 301 https://$host$request_uri;
       }
   }

   server {
       listen 443 ssl;
       server_name your-server-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-server-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-server-domain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /ws {
           proxy_pass http://localhost:8080/ws;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Enable the site:
   ```
   sudo ln -s /etc/nginx/sites-available/messaging-server /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Obtain SSL certificate:
   ```
   sudo certbot --nginx -d your-server-domain.com
   ```

## Vercel Deployment

To deploy the frontend to Vercel:

1. Create a vercel.json file in the root directory:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "*.html", "use": "@vercel/static" },
       { "src": "*.js", "use": "@vercel/static" },
       { "src": "*.css", "use": "@vercel/static" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/$1" }
     ]
   }
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

3. Set environment variables in Vercel:
   - Go to your Vercel project settings
   - Add environment variables for the WebSocket and API URLs
   - Redeploy the application

## Troubleshooting

### WebSocket Connection Issues

1. Check if the WebSocket server is running:
   ```
   curl http://your-server-domain.com/ws
   ```

2. Check server logs:
   ```
   sudo journalctl -u messaging-server.service
   ```

3. Check Nginx logs:
   ```
   sudo tail -f /var/log/nginx/error.log
   ```

### CORS Issues

If you encounter CORS issues, update the WebSocketConfig.java file:

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins("https://your-vercel-app.vercel.app")
            .addInterceptors(handshakeInterceptor)
            .withSockJS();
}
```

## Monitoring

For production monitoring:

1. Add Spring Boot Actuator to pom.xml:
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-actuator</artifactId>
   </dependency>
   ```

2. Configure Actuator endpoints in application.properties:
   ```
   management.endpoints.web.exposure.include=health,info,metrics
   ```

3. Access health endpoint:
   ```
   curl https://your-server-domain.com/actuator/health
   ```

## Scaling

For high-traffic applications:

1. Use a load balancer (e.g., AWS ELB, Nginx)
2. Deploy multiple instances of the WebSocket server
3. Use a message broker like RabbitMQ or Redis for WebSocket message distribution
4. Consider using a managed WebSocket service like AWS API Gateway WebSocket API