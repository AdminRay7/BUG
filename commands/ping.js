module.exports = async (sock, chatId, message) => {
    const start = Date.now();
    await sock.sendMessage(chatId, { text: '🏓 Pong!' });
    const latency = Date.now() - start;
    await sock.sendMessage(chatId, { text: `⏱️ Latency: ${latency}ms` });
};
