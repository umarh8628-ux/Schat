class UIManager {
    constructor() {
        this.elements = {
            status: document.getElementById('status'),
            statusIcon: null,
            statusText: null,
            generateKeysBtn: document.getElementById('generateKeysBtn'),
            keyPanel: document.getElementById('keyPanel'),
            recipientKey: document.getElementById('recipientKey'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            messagesContainer: document.getElementById('messagesContainer'),
            receiveInput: document.getElementById('receiveInput'),
            receiveBtn: document.getElementById('receiveBtn'),
            exportBtn: document.getElementById('exportBtn')
        };
    }

    init() {
        this.elements.statusIcon = this.elements.status.querySelector('.status-icon');
        this.elements.statusText = this.elements.status.querySelector('.status-text');
    }

    updateStatus(locked) {
        if (locked) {
            this.elements.status.classList.add('locked');
            this.elements.status.classList.remove('unlocked');
            this.elements.statusIcon.textContent = '🔒';
            this.elements.statusText.textContent = 'Locked';
        } else {
            this.elements.status.classList.remove('locked');
            this.elements.status.classList.add('unlocked');
            this.elements.statusIcon.textContent = '🔓';
            this.elements.statusText.textContent = 'Unlocked';
        }
    }

    showPublicKey(publicKey) {
        const html = '<div class="public-key-display"><label>Your Public Key (Share this)</label><div class="key-text">' + publicKey + '</div><div class="btn-group"><button class="btn btn-secondary" onclick="app.copyPublicKey()">📋 Copy</button><button class="btn btn-secondary" onclick="app.clearKeys()">🗑️ Clear Keys</button></div></div>';
        this.elements.keyPanel.innerHTML = html;
    }

    resetKeyPanel() {
        this.elements.keyPanel.innerHTML = '<button id="generateKeysBtn" class="btn btn-primary" onclick="app.generateKeys()">Generate Keys</button>';
        this.elements.generateKeysBtn = document.getElementById('generateKeysBtn');
    }

    setInputsEnabled(enabled) {
        this.elements.messageInput.disabled = !enabled;
        this.elements.sendBtn.disabled = !enabled;
    }

    addMessage(message) {
        const emptyState = this.elements.messagesContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = 'message ' + (message.sent ? 'sent' : 'received');
        
        const time = new Date(message.timestamp).toLocaleTimeString();
        
        const headerHtml = '<div class="message-header"><span class="message-type">' + (message.sent ? '📤 Sent' : '📥 Received') + '</span><span class="message-time">' + time + '</span></div>';
        const textHtml = '<div class="message-text">' + message.decrypted + '</div>';
        const encryptedHtml = '<details class="message-encrypted"><summary>Show encrypted</summary><div class="encrypted-content">' + message.encrypted + '</div></details>';
        
        messageEl.innerHTML = headerHtml + textHtml + encryptedHtml;

        this.elements.messagesContainer.appendChild(messageEl);
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;

        this.elements.exportBtn.disabled = false;
    }

    clearMessageInput() {
        this.elements.messageInput.value = '';
    }

    clearReceiveInput() {
        this.elements.receiveInput.value = '';
    }

    showNotification(message, type) {
        alert(message);
    }

    getRecipientKey() {
        return this.elements.recipientKey.value.trim();
    }

    getMessageInput() {
        return this.elements.messageInput.value.trim();
    }

    getReceiveInput() {
        return this.elements.receiveInput.value.trim();
    }
}