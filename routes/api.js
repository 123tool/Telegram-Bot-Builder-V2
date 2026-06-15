const express = require('express');
const router = express.Router();
const db = require('../database');
const { startBot, stopBot } = require('../bot');

// Config
router.get('/config', (req, res) => {
  res.json(db.getConfig());
});

router.post('/config', (req, res) => {
  const newConfig = req.body;
  db.updateConfig(newConfig);
  if (newConfig.botToken) {
    startBot(newConfig.botToken);
  } else {
    stopBot();
  }
  res.json({ success: true });
});

// Commands
router.get('/commands', (req, res) => res.json(db.getCommands()));
router.post('/commands', (req, res) => {
  const { command, response } = req.body;
  const cmds = db.addCommand({ command, response });
  res.json(cmds);
});
router.put('/commands/:id', (req, res) => {
  const id = Number(req.params.id);
  const cmds = db.updateCommand(id, req.body);
  res.json(cmds);
});
router.delete('/commands/:id', (req, res) => {
  const id = Number(req.params.id);
  const cmds = db.deleteCommand(id);
  res.json(cmds);
});

// Autoreplies
router.get('/autoreplies', (req, res) => res.json(db.getAutoreplies()));
router.post('/autoreplies', (req, res) => {
  const { keyword, response } = req.body;
  const ars = db.addAutoreply({ keyword, response });
  res.json(ars);
});
router.put('/autoreplies/:id', (req, res) => {
  const id = Number(req.params.id);
  const ars = db.updateAutoreply(id, req.body);
  res.json(ars);
});
router.delete('/autoreplies/:id', (req, res) => {
  const id = Number(req.params.id);
  const ars = db.deleteAutoreply(id);
  res.json(ars);
});

// Menu
router.get('/menu', (req, res) => res.json(db.getMenu()));
router.post('/menu', (req, res) => {
  const menu = db.updateMenu(req.body);
  res.json(menu);
});

// Users
router.get('/users', (req, res) => res.json(db.getUsers()));
router.post('/broadcast', async (req, res) => {
  const { message } = req.body;
  const users = db.getUsers();
  const botToken = db.getConfig().botToken;
  if (!botToken) return res.status(400).json({ error: 'Bot token not set' });

  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(botToken, { polling: false });
  let success = 0, fail = 0;
  for (const user of users) {
    try {
      await bot.sendMessage(user.id, message);
      success++;
    } catch (e) {
      fail++;
    }
  }
  res.json({ success, fail });
});

// Stats
router.get('/stats', (req, res) => res.json(db.getStats()));

// Test AI
router.post('/test-ai', async (req, res) => {
  const { prompt } = req.body;
  const config = db.getConfig();
  try {
    const { queryAI } = require('../bot');
    const response = await queryAI(prompt, config);
    res.json({ response });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
