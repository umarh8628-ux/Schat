// app.js
// MERN Chat App - Client-side logic

class ChatApp {
    constructor() {
        this.ws = null;
        this.userId = null;
        this.username = null;
        this.isConnected = false;
        this.isTyping = false;
        this.typingTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        
        this.initElements();
        this.attachEventListeners();
    }

    initElements() {
        this.elements = {
            usernameInput: document.getElementById('usernameInput'),
            connectBtn: document.getElementById('connectBtn'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            messagesContainer: document.getElementById('messagesContainer'),
            usersList: document.getElementById('usersList'),
            connectionStatus: document.getElementById('connectionStatus'),
            userCount: document.getElementById('userCount'),
            typingIndicator: document.getElementById('typingIndicator')
        };
    }

    attachEventListeners() {
        this.elements.connectBtn.addEventListener('click', () => this.connect());
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.connect();
        });
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.elements.messageInput.addEventListener('input', () => this.handleTyping());
    }

    connect() {
        const username = this.elements.usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter a username');
            return;
        }

        this.username = username;
        this.userId = 'user-' + Date.now();
        
        this.connectWebSocket();
        this.elements.usernameInput.disabled = true;
        this.elements.connectBtn.disabled = true;
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Send join message
                this.ws.send(JSON.stringify({
                    type: 'join',
                    userId: this.userId,
                    username: this.username
                }));

                this.updateConnectionStatus('Connected ✓', '#22c55e');
                this.elements.messageInput.disabled = false;
                this.elements.sendBtn.disabled = false;
                
                this.addSystemMessage(`${this.username} joined the chat`);
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('Error', '#ef4444');
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus('Disconnected', '#f97316');
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to connect:', error);
            this.attemptReconnect();
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'message':
                this.displayMessage(message);
                break;
            
            case 'userList':
                this.updateUserList(message.users, message.count);
                break;
            
            case 'typing':
                this.handleTypingIndicator(message);
                break;
        }
    }

    displayMessage(message) {
        const msgElement = document.createElement('div');
        msgElement.className = message.userId === this.userId ? 'message own-message' : 'message other-message';
        
        const time = new Date(message.timestamp).toLocaleTimeString();
        
        msgElement.innerHTML = `
            <div class="message-header">
                <span class="username">${message.username}</span>
                <span class="time">${time}</span>
            </div>
            <div class="message-text">${this.escapeHtml(message.text)}</div>
        `;
        
        this.elements.messagesContainer.appendChild(msgElement);
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    sendMessage() {
        const text = this.elements.messageInput.value.trim();
        
        if (!text || !this.isConnected) return;

        this.ws.send(JSON.stringify({
            type: 'message',
            userId: this.userId,
            username: this.username,
            text: text
        }));

        this.elements.messageInput.value = '';
        this.stopTyping();
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.ws.send(JSON.stringify({
                type: 'typing',
                userId: this.userId,
                username: this.username,
                isTyping: true
            }));
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.stopTyping(), 2000);
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.ws.send(JSON.stringify({
                type: 'typing',
                userId: this.userId,
                username: this.username,
                isTyping: false
            }));
        }
    }

    handleTypingIndicator(message) {
        if (message.userId !== this.userId) {
            if (message.isTyping) {
                this.elements.typingIndicator.textContent = `${message.username} is typing...`;
            } else {
                this.elements.typingIndicator.textContent = '';
            }
        }
    }

    updateUserList(users, count) {
        this.elements.userCount.textContent = `${count} user${count !== 1 ? 's' : ''}`;
        
        if (users.length === 0) {
            this.elements.usersList.innerHTML = '<li class="user-item">No other users</li>';
        } else {
            this.elements.usersList.innerHTML = users
                .map(user => `<li class="user-item">${user === this.userId ? '👤 You' : '👤 ' + user}</li>`)
                .join('');
        }
    }

    addSystemMessage(text) {
        const msgElement = document.createElement('div');
        msgElement.className = 'message system-message';
        msgElement.innerHTML = `<div class="message-text">${text}</div>`;
        this.elements.messagesContainer.appendChild(msgElement);
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    updateConnectionStatus(status, color) {
        this.elements.connectionStatus.textContent = status;
        this.elements.connectionStatus.style.color = color;
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connectWebSocket(), this.reconnectDelay);
        } else {
            this.updateConnectionStatus('Failed to connect', '#ef4444');
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is ready
let chatApp;
document.addEventListener('DOMContentLoaded', () => {
    chatApp = new ChatApp();
});
