class CryptoManager {
    constructor() {
        this.keyPair = null;
        this.publicKeyExport = null;
    }

    async generateKeyPair() {
        try {
            this.keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256"
                },
                true,
                ["encrypt", "decrypt"]
            );

            const exported = await window.crypto.subtle.exportKey("spki", this.keyPair.publicKey);
            this.publicKeyExport = btoa(String.fromCharCode(...new Uint8Array(exported)));
            
            return {
                success: true,
                publicKey: this.publicKeyExport
            };
        } catch (error) {
            console.error("Key generation error:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async importPublicKey(base64Key) {
        try {
            const binaryKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
            return await window.crypto.subtle.importKey(
                "spki",
                binaryKey,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );
        } catch (error) {
            console.error("Key import error:", error);
            return null;
        }
    }

    async encrypt(text, recipientPublicKeyBase64) {
        try {
            const recipientKey = await this.importPublicKey(recipientPublicKeyBase64);
            if (!recipientKey) {
                throw new Error("Failed to import recipient's public key");
            }

            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                recipientKey,
                data
            );

            return {
                success: true,
                encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
            };
        } catch (error) {
            console.error("Encryption error:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async decrypt(encryptedBase64) {
        try {
            if (!this.keyPair) {
                throw new Error("No private key available");
            }
            
            const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
            
            const decrypted = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                this.keyPair.privateKey,
                encrypted
            );

            const decoder = new TextDecoder();
            return {
                success: true,
                decrypted: decoder.decode(decrypted)
            };
        } catch (error) {
            console.error("Decryption error:", error);
            return {
                success: false,
                error: error.message,
                decrypted: "[Unable to decrypt]"
            };
        }
    }

    clearKeys() {
        this.keyPair = null;
        this.publicKeyExport = null;
    }

    hasKeys() {
        return this.keyPair !== null;
    }

    getPublicKey() {
        return this.publicKeyExport;
    }
}