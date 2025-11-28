// websocket-client.js
// Handles WebSocket connection for real-time multi-user messaging

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    connect() {
        // Determine WebSocket protocol based on page protocol
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                document.getElementById('connectionStatus').textContent = 'Connected ✓';
                document.getElementById('connectionStatus').style.color = '#22c55e';
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                document.getElementById('connectionStatus').textContent = 'Error';
                document.getElementById('connectionStatus').style.color = '#ef4444';
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                document.getElementById('connectionStatus').textContent = 'Disconnected';
                document.getElementById('connectionStatus').style.color = '#f97316';
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('Failed to connect:', error);
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        }
    }

    send(message) {
        if (this.isConnected && this.ws) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected');
        }
    }

    handleMessage(message) {
        switch (message.type) {
            case 'connection':
                console.log('Connected to server:', message.message);
                break;

            case 'userCount':
                document.getElementById('userCount').textContent = message.count;
                break;

            case 'message':
                // Broadcast received message to app
                if (window.app && window.app.handleNetworkMessage) {
                    window.app.handleNetworkMessage(message.data);
                }
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }
}

// Initialize WebSocket connection when page loads
let wsClient = null;

document.addEventListener('DOMContentLoaded', () => {
    wsClient = new WebSocketClient();
    wsClient.connect();
});
