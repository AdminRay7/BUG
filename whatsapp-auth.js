// whatsapp-auth.js - QR Code handler with file saving
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Create sessions folder if it doesn't exist
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

// Create QR codes folder
const qrDir = path.join(__dirname, 'qr_codes');
if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
}

// Save QR code as image file (text-based)
function saveQRCodeAsFile(qrData, timestamp) {
    const fileName = `qr_code_${timestamp}.txt`;
    const filePath = path.join(qrDir, fileName);
    
    // Save the QR data as text (can be converted to image later)
    fs.writeFileSync(filePath, qrData);
    console.log(`📁 QR Code saved to: ${filePath}`);
    
    // Also save as HTML viewable file
    const htmlPath = path.join(qrDir, `qr_view_${timestamp}.html`);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp QR Code</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: monospace;
            background: #1a1a2e;
            color: white;
        }
        .container { text-align: center; }
        pre { 
            background: white; 
            padding: 20px; 
            border-radius: 10px;
            color: black;
            font-size: 8px;
            line-height: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Scan this QR Code with WhatsApp</h1>
        <p>Open WhatsApp → Settings → Linked Devices → Link a Device</p>
        <pre>${qrData}</pre>
        <p>⏰ This QR code expires in 60 seconds</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`🌐 Viewable QR saved to: ${htmlPath}`);
    
    return { txtFile: filePath, htmlFile: htmlPath };
}

// Create a simple HTTP server to display QR code
function startQRServer(qrData, port = 3001) {
    const express = require('express');
    const qrApp = express();
    
    qrApp.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp QR Code - Ryan MD Bot</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .qr-container {
                        background: white;
                        padding: 30px;
                        border-radius: 20px;
                        text-align: center;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    }
                    pre {
                        font-size: 10px;
                        line-height: 10px;
                        background: #f4f4f4;
                        padding: 20px;
                        border-radius: 10px;
                        overflow-x: auto;
                    }
                    .status {
                        margin-top: 20px;
                        padding: 10px;
                        border-radius: 10px;
                        background: #e8f5e9;
                        color: #2e7d32;
                    }
                    button {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h1>📱 Scan to Connect WhatsApp</h1>
                    <p>1. Open WhatsApp on your phone</p>
                    <p>2. Go to Settings → Linked Devices → Link a Device</p>
                    <p>3. Scan this QR code:</p>
                    <pre>${qrData}</pre>
                    <div class="status">
                        ⏳ Waiting for connection...
                    </div>
                    <button onclick="location.reload()">⟳ Refresh</button>
                </div>
            </body>
            </html>
        `);
    });
    
    qrApp.listen(port, () => {
        console.log(`📱 QR Code web viewer available at: http://localhost:${port}`);
    });
}

// Main WhatsApp client setup with QR saving
function initWhatsAppClient() {
    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: sessionsDir,
            clientId: 'ryan-md-bot'
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    let qrGenerated = false;

    client.on('qr', (qr) => {
        console.log('\n🔐 NEW QR CODE GENERATED\n');
        
        // Display QR in terminal
        qrcode.generate(qr, { small: true });
        
        // Save QR to files
        const timestamp = Date.now();
        const savedFiles = saveQRCodeAsFile(qr, timestamp);
        
        console.log(`\n📁 QR Code saved as:`);
        console.log(`   - ${savedFiles.txtFile}`);
        console.log(`   - ${savedFiles.htmlFile}`);
        
        // Start web server for QR viewing
        try {
            startQRServer(qr, 3001);
        } catch (err) {
            // Express might already be running on main app
        }
        
        qrGenerated = true;
    });

    client.on('ready', () => {
        console.log('\n✅ WhatsApp CLIENT CONNECTED SUCCESSFULLY!\n');
        console.log('🎉 Bot is now online and ready to use!');
        
        // Delete old QR files after successful connection
        if (fs.existsSync(qrDir)) {
            const files = fs.readdirSync(qrDir);
            files.forEach(file => {
                if (file.includes('qr_code_')) {
                    fs.unlinkSync(path.join(qrDir, file));
                    console.log(`🗑️ Deleted old QR file: ${file}`);
                }
            });
        }
    });

    client.on('auth_failure', (msg) => {
        console.error('❌ Authentication failed:', msg);
        console.log('🔄 Please restart the bot to get a new QR code');
    });

    client.on('disconnected', (reason) => {
        console.log('⚠️ Client disconnected:', reason);
        console.log('🔄 Restart the bot to reconnect');
    });

    return client;
}

// Auto-detect QR code from terminal (for monitoring)
function monitorQRCode() {
    const monitor = () => {
        const qrFiles = fs.readdirSync(qrDir).filter(f => f.startsWith('qr_code_'));
        if (qrFiles.length > 0) {
            const latestQR = qrFiles.sort().reverse()[0];
            const qrPath = path.join(qrDir, latestQR);
            const qrData = fs.readFileSync(qrPath, 'utf-8');
            console.log('\n📱 CURRENT QR CODE AVAILABLE!');
            qrcode.generate(qrData, { small: true });
            console.log(`\n📁 Also saved at: ${qrPath}\n`);
        }
    };
    
    setInterval(monitor, 5000); // Check every 5 seconds
}

module.exports = { initWhatsAppClient, monitorQRCode };