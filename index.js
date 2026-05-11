// index.js - Main server entry point with web dashboard and API

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// ========== INITIALIZATION ==========
const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ========== DATABASE SETUP ==========
const dbPath = path.join(__dirname, 'database');

// Create database folder if not exists
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

// Database file paths
const dbFiles = {
    settings: path.join(dbPath, 'settings.json'),
    users: path.join(dbPath, 'users.json'),
    groups: path.join(dbPath, 'groups.json'),
    warnings: path.join(dbPath, 'warnings.json'),
    bans: path.join(dbPath, 'bans.json'),
    antilink: path.join(dbPath, 'antilink.json'),
    antibadword: path.join(dbPath, 'antibadword.json'),
    antitag: path.join(dbPath, 'antitag.json'),
    welcome: path.join(dbPath, 'welcome.json'),
    goodbye: path.join(dbPath, 'goodbye.json'),
    mute: path.join(dbPath, 'mute.json'),
    antidelete: path.join(dbPath, 'antidelete.json'),
    autostatus: path.join(dbPath, 'autostatus.json'),
    autotyping: path.join(dbPath, 'autotyping.json'),
    autoread: path.join(dbPath, 'autoread.json'),
    autorecording: path.join(dbPath, 'autorecording.json'),
    autosticker: path.join(dbPath, 'autosticker.json'),
    chatbot: path.join(dbPath, 'chatbot.json'),
    mention: path.join(dbPath, 'mention.json'),
    messageCount: path.join(dbPath, 'messageCount.json'),
    pmblocker: path.join(dbPath, 'pmblocker.json'),
    reactions: path.join(dbPath, 'reactions.json'),
    games: path.join(dbPath, 'games.json')
};

// Initialize database files with default values
function initDatabase() {
    const defaults = {
        settings: { 
            isPublic: true, 
            prefix: '.', 
            botName: 'Ryan MD',
            version: '1.0.0',
            owner: process.env.OWNER_NUMBER || '1234567890'
        },
        users: {},
        groups: {},
        warnings: {},
        bans: {},
        antilink: {},
        antibadword: {},
        antitag: {},
        welcome: {},
        goodbye: {},
        mute: {},
        antidelete: {},
        autostatus: {},
        autotyping: {},
        autoread: {},
        autorecording: {},
        autosticker: {},
        chatbot: {},
        mention: {},
        messageCount: { 
            counts: {}, 
            isPublic: true,
            lastReset: new Date().toISOString()
        },
        pmblocker: { enabled: false, message: 'Private messages are blocked.' },
        reactions: {},
        games: {}
    };

    for (const [key, filePath] of Object.entries(dbFiles)) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaults[key] || {}, null, 2));
            console.log(`✅ Created database: ${key}.json`);
        }
    }
}

// Database operations class
class Database {
    constructor() {
        this.init();
    }

    init() {
        initDatabase();
        console.log('✅ Database initialized');
    }

    read(table) {
        return new Promise((resolve, reject) => {
            const filePath = dbFiles[table];
            if (!filePath) {
                reject(new Error(`Table '${table}' not found`));
                return;
            }
            try {
                const data = fs.readFileSync(filePath, 'utf-8');
                resolve(JSON.parse(data));
            } catch (err) {
                reject(err);
            }
        });
    }

    write(table, data) {
        return new Promise((resolve, reject) => {
            const filePath = dbFiles[table];
            if (!filePath) {
                reject(new Error(`Table '${table}' not found`));
                return;
            }
            try {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }

    async update(table, key, value) {
        const data = await this.read(table);
        data[key] = value;
        return this.write(table, data);
    }

    async get(table, key) {
        const data = await this.read(table);
        return data[key];
    }

    async delete(table, key) {
        const data = await this.read(table);
        delete data[key];
        return this.write(table, data);
    }
}

const db = new Database();
const dbPromise = Promise.resolve(db);

// ========== WEB DASHBOARD ROUTES ==========

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ========== API ROUTES ==========

// Bot status endpoint
app.get('/api/status', async (req, res) => {
    try {
        const settings = await db.read('settings');
        const stats = {
            status: 'online',
            botName: settings.botName,
            version: settings.version,
            uptime: process.uptime(),
            isPublic: settings.isPublic,
            prefix: settings.prefix,
            timestamp: new Date().toISOString()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get bot settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await db.read('settings');
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update bot settings
app.post('/api/settings', async (req, res) => {
    try {
        const { isPublic, prefix, botName } = req.body;
        const settings = await db.read('settings');
        
        if (isPublic !== undefined) settings.isPublic = isPublic;
        if (prefix !== undefined) settings.prefix = prefix;
        if (botName !== undefined) settings.botName = botName;
        
        await db.write('settings', settings);
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get banned users
app.get('/api/bans', async (req, res) => {
    try {
        const bans = await db.read('bans');
        res.json(bans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unban user
app.post('/api/unban/:jid', async (req, res) => {
    try {
        const { jid } = req.params;
        const bans = await db.read('bans');
        delete bans[jid];
        await db.write('bans', bans);
        res.json({ success: true, message: `User ${jid} unbanned` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get group settings
app.get('/api/groups', async (req, res) => {
    try {
        const groups = await db.read('groups');
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get warnings for a user
app.get('/api/warnings/:jid', async (req, res) => {
    try {
        const { jid } = req.params;
        const warnings = await db.read('warnings');
        res.json({ warnings: warnings[jid] || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get message statistics
app.get('/api/stats/messages', async (req, res) => {
    try {
        const messageCount = await db.read('messageCount');
        const totalMessages = Object.values(messageCount.counts || {}).reduce((a, b) => a + b, 0);
        res.json({
            totalMessages,
            topUsers: Object.entries(messageCount.counts || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([jid, count]) => ({ jid, count }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get antilink settings
app.get('/api/antilink/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const antilink = await db.read('antilink');
        res.json({ enabled: antilink[groupJid] || false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update antilink settings
app.post('/api/antilink/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const { enabled } = req.body;
        const antilink = await db.read('antilink');
        antilink[groupJid] = enabled;
        await db.write('antilink', antilink);
        res.json({ success: true, enabled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get antibadword settings
app.get('/api/antibadword/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const antibadword = await db.read('antibadword');
        res.json({ enabled: antibadword[groupJid] || false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get welcome message settings
app.get('/api/welcome/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const welcome = await db.read('welcome');
        res.json(welcome[groupJid] || { enabled: false, message: '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get goodbye message settings
app.get('/api/goodbye/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const goodbye = await db.read('goodbye');
        res.json(goodbye[groupJid] || { enabled: false, message: '' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chatbot settings
app.get('/api/chatbot/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const chatbot = await db.read('chatbot');
        res.json({ enabled: chatbot[groupJid] || false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update chatbot settings
app.post('/api/chatbot/:groupJid', async (req, res) => {
    try {
        const { groupJid } = req.params;
        const { enabled } = req.body;
        const chatbot = await db.read('chatbot');
        chatbot[groupJid] = enabled;
        await db.write('chatbot', chatbot);
        res.json({ success: true, enabled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all groups with settings
app.get('/api/groups/settings', async (req, res) => {
    try {
        const [antilink, antibadword, antitag, welcome, goodbye, chatbot] = await Promise.all([
            db.read('antilink'),
            db.read('antibadword'),
            db.read('antitag'),
            db.read('welcome'),
            db.read('goodbye'),
            db.read('chatbot')
        ]);

        const allGroupIds = new Set([
            ...Object.keys(antilink),
            ...Object.keys(antibadword),
            ...Object.keys(antitag),
            ...Object.keys(welcome),
            ...Object.keys(goodbye),
            ...Object.keys(chatbot)
        ]);

        const groups = Array.from(allGroupIds).map(groupJid => ({
            groupJid,
            antilink: antilink[groupJid] || false,
            antibadword: antibadword[groupJid] || false,
            antitag: antitag[groupJid] || false,
            welcome: welcome[groupJid]?.enabled || false,
            goodbye: goodbye[groupJid]?.enabled || false,
            chatbot: chatbot[groupJid] || false
        }));

        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== HTML DASHBOARD ==========

// Serve dashboard HTML
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ryan MD Bot - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .card h2 {
            color: #667eea;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #667eea;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .status-online {
            background: #10b981;
            color: white;
        }
        
        .table {
            width: 100%;
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        
        th {
            background: #f8f9fa;
            color: #667eea;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: opacity 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        
        .btn:hover {
            opacity: 0.8;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Ryan MD Bot Dashboard</h1>
            <p>WhatsApp Bot Management System</p>
        </div>
        
        <div class="stats-grid" id="statsGrid">
            <div class="stat-card">
                <h3>Bot Status</h3>
                <div class="value" id="botStatus">Loading...</div>
            </div>
            <div class="stat-card">
                <h3>Uptime</h3>
                <div class="value" id="uptime">Loading...</div>
            </div>
            <div class="stat-card">
                <h3>Total Messages</h3>
                <div class="value" id="totalMessages">Loading...</div>
            </div>
            <div class="stat-card">
                <h3>Bot Mode</h3>
                <div class="value" id="botMode">Loading...</div>
            </div>
        </div>
        
        <div class="card">
            <h2>⚙️ Bot Settings</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div>
                    <label>Bot Name:</label>
                    <input type="text" id="botName" style="padding: 8px; margin-left: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <button onclick="updateSettings()" class="btn btn-primary" style="margin-left: 10px;">Save</button>
                </div>
                <div>
                    <label>Public Mode:</label>
                    <label class="toggle-switch">
                        <input type="checkbox" id="publicMode" onchange="toggleMode()">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>👥 Top Users</h2>
            <div class="table">
                <table id="topUsersTable">
                    <thead>
                        <tr><th>User</th><th>Messages</th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Ryan MD Bot &copy; 2024 | All Rights Reserved</p>
    </div>
    
    <script>
        async function fetchStats() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                document.getElementById('botStatus').innerHTML = '<span class="status-badge status-online">Online</span>';
                document.getElementById('uptime').innerText = formatUptime(data.uptime);
                document.getElementById('botMode').innerText = data.isPublic ? 'Public' : 'Private';
                document.getElementById('publicMode').checked = data.isPublic;
                document.getElementById('botName').value = data.botName;
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        }
        
        async function fetchMessageStats() {
            try {
                const response = await fetch('/api/stats/messages');
                const data = await response.json();
                document.getElementById('totalMessages').innerText = data.totalMessages || 0;
                
                const tbody = document.querySelector('#topUsersTable tbody');
                tbody.innerHTML = '';
                (data.topUsers || []).forEach(user => {
                    const row = tbody.insertRow();
                    row.insertCell(0).innerText = user.jid;
                    row.insertCell(1).innerText = user.count;
                });
            } catch (error) {
                console.error('Error fetching message stats:', error);
            }
        }
        
        function formatUptime(seconds) {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            return ${days}d ${hours}h ${minutes}m ${secs}s;
        }
        
        async function toggleMode() {
            const isPublic = document.getElementById('publicMode').checked;
            try {
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isPublic })
                });
                const data = await response.json();
                if (data.success) {
                    document.getElementById('botMode').innerText = isPublic ? 'Public' : 'Private';
                }
            } catch (error) {
                console.error('Error toggling mode:', error);
            }
        }
        
        async function updateSettings() {
            const botName = document.getElementById('botName').value;
            try {
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ botName })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Settings updated successfully!');
                }
            } catch (error) {
                console.error('Error updating settings:', error);
                alert('Failed to update settings');
            }
        }
        
        // Refresh stats every 10 seconds
        fetchStats();
        fetchMessageStats();
        setInterval(() => {
            fetchStats();
            fetchMessageStats();
        }, 10000);
    </script>
</body>
</html>
    `);
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// ========== ERROR HANDLING ==========
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ========== EXPORTS ==========
module.exports = { app, dbPromise };
