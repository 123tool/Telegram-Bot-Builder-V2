const express = require('express');
const path = require('path');
const { initDB, getConfig } = require('./database');
const apiRoutes = require('./routes/api');
const { startBot, stopBot } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.get('/ping', (req, res) => res.json({ status: 'ok' }));

initDB();

// Cek apakah bot token tersimpan, jika ya jalankan bot
const config = getConfig();
if (config && config.botToken) {
  startBot(config.botToken);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Builder running at http://localhost:${PORT}`);
});
