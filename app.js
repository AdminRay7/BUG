const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 3000;

// WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './sessions'
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 SCAN THIS QR CODE:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n👉 Open WhatsApp → Settings → Linked Devices → Link a Device\n');
});

client.on('ready', () => {
    console.log('\n✅✅✅ WHATSAPP CONNECTED! ✅✅✅\n');
});

client.on('message', async (msg) => {
    if (msg.body === '.ping') {
        await msg.reply('🏓 Pong!');
    }
});

client.initialize();

// Web server
app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 Ryan MD Bot</h1>
        <p>Status: <strong>${client.info ? 'Connected ✅' : 'Waiting for QR scan...'}</strong></p>
        <p>Check the Console tab for QR code!</p>
    `);
});

app.listen(PORT, () => {
    console.log(`\n🚀 Web server: http://localhost:${PORT}`);
    console.log('📱 Waiting for WhatsApp QR code...\n');
});

console.log('Bot starting...');