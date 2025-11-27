class SecureMessengerApp {
    constructor() {
        this.crypto = new CryptoManager();
        this.ui = new UIManager();
        this.messages = [];
        this.wsClient = null;
    }

    init() {
        this.ui.init();
        this.attachEventListeners();
        console.log('Secure Messenger initialized');
    }

    attachEventListeners() {
        this.ui.elements.generateKeysBtn.addEventListener('click', () => this.generateKeys());
        this.ui.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.ui.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.ui.elements.receiveBtn.addEventListener('click', () => this.receiveMessage());
        this.ui.elements.exportBtn.addEventListener('click', () => this.exportConversation());
    }

    setWebSocketClient(wsClient) {
        this.wsClient = wsClient;
    }

    handleNetworkMessage(messageData) {
        // Handle messages received from other users via WebSocket
        if (messageData && messageData.encrypted) {
            const message = {
                id: Date.now(),
                encrypted: messageData.encrypted,
                decrypted: messageData.decrypted || '[Encrypted from network]',
                timestamp: new Date().toISOString(),
                sent: false,
                fromNetwork: true
            };
            this.messages.push(message);
            this.ui.addMessage(message);
        }
    }

    async generateKeys() {
        const result = await this.crypto.generateKeyPair();
        
        if (result.success) {
            this.ui.updateStatus(false);
            this.ui.showPublicKey(result.publicKey);
            this.ui.setInputsEnabled(true);
            this.ui.showNotification('Keys generated successfully!');
        } else {
            this.ui.showNotification('Failed to generate keys: ' + result.error, 'error');
        }
    }

    async sendMessage() {
        const messageText = this.ui.getMessageInput();
        const recipientKey = this.ui.getRecipientKey();

        if (!messageText) {
            this.ui.showNotification('Please enter a message');
            return;
        }

        if (!recipientKey) {
            this.ui.showNotification('Please enter recipient public key');
            return;
        }

        const result = await this.crypto.encrypt(messageText, recipientKey);

        if (result.success) {
            const message = {
                id: Date.now(),
                encrypted: result.encrypted,
                decrypted: messageText,
                timestamp: new Date().toISOString(),
                sent: true
            };

            this.messages.push(message);
            this.ui.addMessage(message);
            this.ui.clearMessageInput();

            // Broadcast encrypted message to all connected users via WebSocket
            if (this.wsClient && this.wsClient.isConnected) {
                this.wsClient.send({
                    type: 'message',
                    encrypted: result.encrypted,
                    decrypted: messageText,
                    senderPublicKey: this.crypto.getPublicKey()
                });
            }
        } else {
            this.ui.showNotification('Encryption failed: ' + result.error, 'error');
        }
    }

    async receiveMessage() {
        const encryptedText = this.ui.getReceiveInput();

        if (!encryptedText) {
            this.ui.showNotification('Please paste an encrypted message');
            return;
        }

        const result = await this.crypto.decrypt(encryptedText);

        const message = {
            id: Date.now(),
            encrypted: encryptedText,
            decrypted: result.decrypted,
            timestamp: new Date().toISOString(),
            sent: false
        };

        this.messages.push(message);
        this.ui.addMessage(message);
        this.ui.clearReceiveInput();

        if (!result.success) {
            this.ui.showNotification('Message added but decryption failed', 'warning');
        }
    }

    copyPublicKey() {
        const publicKey = this.crypto.getPublicKey();
        navigator.clipboard.writeText(publicKey).then(() => {
            this.ui.showNotification('Public key copied to clipboard!');
        });
    }

    clearKeys() {
        if (confirm('Are you sure you want to clear your keys? This cannot be undone.')) {
            this.crypto.clearKeys();
            this.ui.updateStatus(true);
            this.ui.resetKeyPanel();
            this.ui.setInputsEnabled(false);
            this.attachEventListeners();
        }
    }

    exportConversation() {
        const data = {
            messages: this.messages,
            publicKey: this.crypto.getPublicKey(),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'secure-conversation-' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(url);

        this.ui.showNotification('Conversation exported successfully!');
    }
}

const app = new SecureMessengerApp();
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    // Set WebSocket client after it's initialized
    if (typeof wsClient !== 'undefined') {
        app.setWebSocketClient(wsClient);
    }
});