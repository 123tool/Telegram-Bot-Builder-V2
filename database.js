const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

function initDB() {
  db.defaults({
    config: {
      botToken: '',
      welcomeMessage: '👋 Selamat datang! Gunakan /help untuk melihat bantuan.',
      aiProvider: 'openai',
      aiApiKey: '',
      aiModel: 'gpt-3.5-turbo',
      aiFallback: false,
    },
    commands: [],
    autoreplies: [],
    menu: { buttons: [] },
    users: [],
    stats: { totalMessages: 0 }
  }).write();
}

function getConfig() {
  return db.get('config').value();
}

function updateConfig(newConfig) {
  db.set('config', { ...getConfig(), ...newConfig }).write();
  return getConfig();
}

function getCommands() {
  return db.get('commands').value();
}

function addCommand(cmd) {
  db.get('commands').push({ id: Date.now(), ...cmd }).write();
  return getCommands();
}

function updateCommand(id, data) {
  db.get('commands').find({ id }).assign(data).write();
  return getCommands();
}

function deleteCommand(id) {
  db.get('commands').remove({ id }).write();
  return getCommands();
}

function getAutoreplies() {
  return db.get('autoreplies').value();
}

function addAutoreply(reply) {
  db.get('autoreplies').push({ id: Date.now(), ...reply }).write();
  return getAutoreplies();
}

function updateAutoreply(id, data) {
  db.get('autoreplies').find({ id }).assign(data).write();
  return getAutoreplies();
}

function deleteAutoreply(id) {
  db.get('autoreplies').remove({ id }).write();
  return getAutoreplies();
}

function getMenu() {
  return db.get('menu').value();
}

function updateMenu(menu) {
  db.set('menu', menu).write();
  return getMenu();
}

function addUser(user) {
  const exists = db.get('users').find({ id: user.id }).value();
  if (!exists) {
    db.get('users').push({ ...user, joinedAt: new Date().toISOString() }).write();
  }
}

function getUsers() {
  return db.get('users').value();
}

function getStats() {
  return {
    commands: db.get('commands').size().value(),
    autoreplies: db.get('autoreplies').size().value(),
    users: db.get('users').size().value(),
    totalMessages: db.get('stats.totalMessages').value()
  };
}

function incrementMessageCount() {
  db.set('stats.totalMessages', db.get('stats.totalMessages').value() + 1).write();
}

module.exports = {
  initDB,
  getConfig,
  updateConfig,
  getCommands,
  addCommand,
  updateCommand,
  deleteCommand,
  getAutoreplies,
  addAutoreply,
  updateAutoreply,
  deleteAutoreply,
  getMenu,
  updateMenu,
  addUser,
  getUsers,
  getStats,
  incrementMessageCount
};
