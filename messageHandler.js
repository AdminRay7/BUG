const fs = require('fs');

// Import your commands
const helpCommand = require('../commands/help');
const pingCommand = require('../commands/ping');
const ownerCommand = require('../commands/owner');

// Main message handler
async function handleMessages(sock, { messages, type }) {
    try {
        const message = messages[0];
        if (!message.message) return;
        
        const chatId = message.key.remoteJid;
        const messageText = message.message.conversation || 
                           message.message.extendedTextMessage?.text || '';
        
        // Skip if not a command
        if (!messageText.startsWith('.')) return;
        
        console.log(`📝 Command received: ${messageText} from ${chatId}`);
        
        // Parse command
        const command = messageText.split(' ')[0].toLowerCase();
        const args = messageText.slice(command.length).trim();
        
        // Command handlers
        switch(command) {
            case '.help':
            case '.menu':
                await helpCommand(sock, chatId, message);
                break;
                
            case '.ping':
                await pingCommand(sock, chatId, message);
                break;
                
            case '.owner':
                await ownerCommand(sock, chatId);
                break;
                
            default:
                // Unknown command
                await sock.sendMessage(chatId, {
                    text: '❌ Unknown command. Use .help for available commands.'
                }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error in message handler:', error);
    }
}

async function handleGroupParticipantUpdate(sock, update) {
    // Handle group join/leave events
    const { id, participants, action } = update;
    
    if (action === 'add') {
        for (const participant of participants) {
            await sock.sendMessage(id, {
                text: `👋 Welcome @${participant.split('@')[0]} to the group!`,
                mentions: [participant]
            });
        }
    }
    
    if (action === 'remove') {
        for (const participant of participants) {
            await sock.sendMessage(id, {
                text: `👋 Goodbye @${participant.split('@')[0]}`,
                mentions: [participant]
            });
        }
    }
}

async function handleStatus(sock, status) {
    // Handle status updates
    console.log('Status update:', status);
}

module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus
};