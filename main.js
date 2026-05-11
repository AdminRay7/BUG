require('dotenv').config();
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

// ========== TEMP FOLDER SETUP ==========
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

// Auto-clean temp files every 3 hours
setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000) {
                    fs.unlink(filePath, () => {});
                }
            });
        }
    });
}, 3 * 60 * 60 * 1000);

// ========== IMPORTS ==========
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./handlers/messageHandler');

// ========== SESSION MANAGEMENT ==========
const sessionPath = './session';
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

// ========== BOT CONNECTION ==========
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: P({ level: 'silent' }),
        browser: ['Ryan MD Bot', 'Chrome', '1.0.0']
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📱 Scan the QR code with WhatsApp');
        }
        
        if (connection === 'open') {
            console.log('✅ Bot connected successfully!');
            console.log(`📊 Bot is running on: ${sock.user.id}`);
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Connection closed:', lastDisconnect?.error);
            
            if (shouldReconnect) {
                console.log('🔄 Reconnecting...');
                connectToWhatsApp();
            } else {
                console.log('⚠️ Session logged out. Delete session folder and restart.');
            }
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const msg of messages) {
                await handleMessages(sock, { messages: [msg], type });
            }
        }
    });

    // Handle group participant updates
    sock.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(sock, update);
    });

    // Handle presence updates (if needed)
    sock.ev.on('presence.update', async (update) => {
        // Optional: handle presence
    });

    return sock;
}

// ========== START BOT ==========
connectToWhatsApp().catch(err => {
    console.error('❌ Failed to connect:', err);
    process.exit(1);
});

// ========== PROCESS HANDLERS ==========
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down...');
    process.exit(0);
});