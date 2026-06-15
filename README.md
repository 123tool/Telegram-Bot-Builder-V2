## 🤖 Telegram Bot Builder V2

**Professional Telegram bot management dashboard** that runs entirely on Termux/localhost. Build custom commands, auto-replies, menu buttons, broadcast to users, and connect AI providers – all from a sleek web interface.

---

## ✨ Features

- 🔧 **Command Builder** – Create custom `/commands` with instant response.
- 🔄 **Auto-Reply** – Keyword-based automatic replies.
- 📋 **Menu Buttons** – Design reply keyboard menus with linked commands.
- 👋 **Welcome Message** – Customize the first message when users start the bot.
- 👥 **User Database** – Automatically saves every user who starts the bot.
- 📢 **Broadcast** – Send messages to all saved users at once.
- 🧠 **AI Integration** – Connect OpenAI, Google Gemini, or Anthropic. Fallback to AI for unknown messages.
- 📊 **Live Statistics** – View total users, commands, messages.
- 🎨 **Modern Dark UI** – Clean, professional dashboard.
- 💾 **JSON-based Storage** – No external database needed.

---

## 📋 Requirements

- Termux (Android) or any Linux environment with Node.js 16+
- Node.js & npm installed (`pkg install nodejs` on Termux)

---

## 🚀 Installation

```bash
pkg update && pkg upgrade
pkg install nodejs git -y
git clone https://github.com/123tool/Telegram-Bot-Builder-V2.git
cd Telegram-Bot-Builder-V2
bash install.sh
```

## 🟢 Running the Server

```bash
bash start.sh
```

The dashboard will be available at 
```
http://localhost:3000.
```
The bot will automatically start polling if a valid token is saved.

To stop, press `Ctrl+C`.

---

## 🧪 How to Use

1. Open the dashboard.
2. Go to Config, paste your bot token from @BotFather, and save.
3. Add commands, auto-replies, and a welcome message.
4. Create a menu for quick access.
5. (Optional) Enter AI API key and enable fallback.
6. Start chatting with your bot on Telegram.

---

## 📁 Project Structure

```
telegram-bot-builder-V2/
├── server.js        # Express server & bot launcher
├── database.js      # LowDB wrapper (config, users, commands, etc.)
├── bot.js           # Telegram bot logic & AI connectors
├── routes/api.js    # REST API endpoints
├── public/          # Dashboard frontend
│   ├── index.html
│   ├── style.css
│   └── app.js
├── install.sh       # Dependency installer
├── start.sh         # Server starter
├── package.json
└── README.md
```

## 🔌 API Endpoints (Dashboard consumes these)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/config` | Get bot configuration |
| **POST** | `/api/config` | Update config & restart bot |
| **GET** | `/api/commands` | List commands |
| **POST** | `/api/commands` | Add command |
| **PUT** | `/api/commands/:id` | Edit command |
| **DELETE** | `/api/commands/:id` | Delete command |
| **GET** | `/api/autoreplies` | List auto-replies |
| *...* | *...* | CRUD for autoreplies |
| **GET** | `/api/menu` | Get menu layout |
| **POST** | `/api/menu` | Save menu layout |
| **GET** | `/api/users` | List saved users |
| **POST** | `/api/broadcast` | Send broadcast message |
| **GET** | `/api/stats` | Get statistics |
| **POST** | `/api/test-ai` | Test AI provider |

---

## 🧠 Supported AI Providers

- OpenAI (GPT-3.5, GPT-4)
- Google Gemini (gemini-pro)
- Anthropic (Claude 3 Opus, etc.)

Enter API key and model in the Config panel.

---

## 🔒 Security

This tool is designed for local use. Do not expose the dashboard to the public internet without authentication.

---

## 🛠 Troubleshooting

- Bot not responding? Check token validity and internet connection.
- AI error? Ensure API key and model name are correct.
- Port conflict? Change PORT environment variable.

---

## 📦 Deployment

For permanent hosting, use a VPS with Node.js. You can also deploy to platforms like Railway or Render, but you must add authentication.

---

## 📄 License

MIT. Use responsibly. **SPY-E & 123Tool.**

---

## ⭐ Support

If you find this project useful, give it a **star** on GitHub!
