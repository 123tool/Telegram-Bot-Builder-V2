const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const db = require('./database');

let bot = null;

function startBot(token) {
  if (bot) {
    bot.stopPolling();
  }
  bot = new TelegramBot(token, { polling: true });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const userId = msg.from.id;

    db.incrementMessageCount();

    // Simpan user
    db.addUser({
      id: userId,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      username: msg.from.username
    });

    // Cek /start
    if (text === '/start') {
      const config = db.getConfig();
      bot.sendMessage(chatId, config.welcomeMessage || 'Welcome!');
      return;
    }

    // Cek commands
    const commands = db.getCommands();
    const matchedCmd = commands.find(cmd => cmd.command === text);
    if (matchedCmd) {
      bot.sendMessage(chatId, matchedCmd.response);
      return;
    }

    // Cek menu buttons
    const menu = db.getMenu();
    if (menu.buttons && menu.buttons.length > 0) {
      for (const row of menu.buttons) {
        for (const btn of row) {
          if (btn.text === text) {
            const cmd = commands.find(c => c.command === btn.command);
            if (cmd) {
              bot.sendMessage(chatId, cmd.response);
              return;
            }
            // Jika command tidak ditemukan, kirim teks kosong?
            bot.sendMessage(chatId, `Command ${btn.command} tidak ditemukan.`);
            return;
          }
        }
      }
    }

    // Cek autoreplies
    const autoreplies = db.getAutoreplies();
    for (const ar of autoreplies) {
      if (text.toLowerCase().includes(ar.keyword.toLowerCase())) {
        bot.sendMessage(chatId, ar.response);
        return;
      }
    }

    // AI fallback jika tidak ada yang cocok
    const config = db.getConfig();
    if (config.aiFallback && config.aiApiKey) {
      try {
        const aiResponse = await queryAI(text, config);
        bot.sendMessage(chatId, aiResponse);
      } catch (e) {
        bot.sendMessage(chatId, 'Maaf, AI sedang error.');
      }
    }
    // Jika tidak ada fallback, diam saja
  });

  console.log('[BOT] Telegram bot started.');
}

function stopBot() {
  if (bot) {
    bot.stopPolling();
    bot = null;
    console.log('[BOT] Stopped.');
  }
}

async function queryAI(prompt, config) {
  // Support multiple providers
  if (config.aiProvider === 'openai') {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.aiModel || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      },
      { headers: { Authorization: `Bearer ${config.aiApiKey}` } }
    );
    return res.data.choices[0].message.content.trim();
  } else if (config.aiProvider === 'gemini') {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.aiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    return res.data.candidates[0].content.parts[0].text;
  } else if (config.aiProvider === 'anthropic') {
    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: config.aiModel || 'claude-3-opus-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': config.aiApiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    return res.data.content[0].text;
  }
  return 'Provider AI tidak dikenali.';
}

module.exports = { startBot, stopBot };
