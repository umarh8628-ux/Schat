// server.js
// MERN Chat App - Express + WebSocket Server
// Configured for Render free tier deployment

require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Store connected users
const users = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('User connected. Total users:', wss.clients.size);
  
  let userId = null;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'join':
          userId = message.userId;
          users.set(userId, ws);
          broadcastUserList();
          console.log(`User ${userId} joined`);
          break;

        case 'message':
          broadcastMessage({
            type: 'message',
            userId: message.userId,
            username: message.username,
            text: message.text,
            timestamp: new Date().toISOString()
          });
          break;

        case 'typing':
          broadcastTyping({
            type: 'typing',
            userId: message.userId,
            username: message.username,
            isTyping: message.isTyping
          });
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    if (userId) {
      users.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
    broadcastUserList();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast functions
function broadcastMessage(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function broadcastTyping(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function broadcastUserList() {
  const userList = Array.from(users.keys());
  const userCount = wss.clients.size;
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'userList',
        users: userList,
        count: userCount
      }));
    }
  });
}

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Chat server running on ${HOST}:${PORT}`);
  console.log(`📡 WebSocket server active`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
