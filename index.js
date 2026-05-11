const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Check if WhatsApp package is installed
let whatsappReady = false;
try {
    require('whatsapp-web.js');
    whatsappReady = true;
    console.log('✅ WhatsApp package is INSTALLED!');
} catch(e) {
    console.log('⚠️ Run: npm install whatsapp-web.js qrcode-terminal');
}

app.get('/', (req, res) => {
    res.send(`
        <h1>Ryan MD Bot</h1>
        <p>Status: ${whatsappReady ? '✅ Ready to connect' : '⚠️ Installing packages...'}</p>
        <p>Check Console for QR code</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Only try to use WhatsApp if installed
if (whatsappReady) {
    const { Client, LocalAuth } = require('whatsapp-web.js');
    const qrcode = require('qrcode-terminal');
    
    const client = new Client({
        authStrategy: new LocalAuth({
            dataPath: './sessions'
        })
    });
    
    client.on('qr', (qr) => {
        console.log('SCAN THIS QR CODE:');
        qrcode.generate(qr, { small: true });
    });
    
    client.on('ready', () => {
        console.log('✅ BOT IS CONNECTED TO WHATSAPP!');
    });
    
    client.initialize();
}