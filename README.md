<!-- ═══════════════════════════════════════════════════════════ -->
<!-- LEGEND MD - WhatsApp Bot Documentation -->
<!-- ═══════════════════════════════════════════════════════════ -->

# 🤖 LEGEND MD - Advanced WhatsApp Bot

> **A powerful, modular WhatsApp bot with anti-tamper protection, multi-platform media downloads, and flexible command system**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Active-success)

---

## ✨ Features

### 🎯 Core Features
- ✅ **Multi-Device Support** - Connect from any device using Pair Code
- ✅ **Modular Command System** - Easy-to-add plugins and extensions
- ✅ **Anti-Tamper Protection** - Watermark verification on all bot messages
- ✅ **Auto Features** - Status reading, auto-react, message reading
- ✅ **Group Management** - Kick, promote, demote, warn users
- ✅ **Beautiful UI** - Formatted messages with ASCII boxes and emojis

### 📥 Media Downloads
- 📱 **Facebook** - Download videos and photos
- 📷 **Instagram** - Download reels, photos, and videos
- 🎵 **TikTok** - Download videos without watermark
- 🎬 **YouTube** - Download videos and audio (MP3)
- 🐦 **Twitter/X** - Download media and videos
- 🖼️ **Sticker Creator** - Convert images to WhatsApp stickers

### 🛡️ Security & Anti-Features
- 🔒 **Anti-Link** - Remove users posting links
- 🚫 **Anti-Delete** - Log deleted messages
- ⚠️ **Warning System** - Automatic kick after warnings
- 👤 **Owner Protection** - Owner-only sensitive commands
- 🔐 **Pair Code Auth** - No QR code exposure

### 🎮 Owner Commands
- `.eval <code>` - Execute JavaScript
- `.restart` - Restart the bot
- `.shutdown` - Shutdown bot
- `.getfile <path>` - Read file contents

---

## 📋 Command Categories

### 🟢 General Commands
```
.ping              Check bot latency
.menu              Show command menu
.menu2             Complete command list
.help [command]    Get help on commands
.alive             Check bot status
```

### 🔵 Media Commands
```
.fb <url>          Download Facebook video
.ig <url>          Download Instagram media
.tiktok <url>      Download TikTok video
.yt <url> [format] Download YouTube video/audio
```

### 🟠 Utility Commands
```
.sticker           Convert image to sticker
.ocr              Read text from image
.qr <text>        Generate QR code
.base64 <text>    Encode to base64
.decode <text>    Decode from base64
```

### 🟣 Group Commands (Admin/Owner)
```
.kick @user        Remove user from group
.promote @user     Make user admin
.demote @user      Remove user as admin
.mute              Mute group
.unmute            Unmute group
```

### 🟡 Owner Commands (Secret)
```
.eval <code>       Execute JavaScript code
.restart           Restart bot
.shutdown          Shutdown bot
.getfile <path>    Read file contents
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** (Node Package Manager)
- WhatsApp account (for authentication)

### Step 1: Clone the Repository
```bash
git clone https://github.com/LeGenDX96/LEGEND-MD.git
cd LEGEND-MD
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Create a `.env` file in the root directory:

```env
# Owner Information
OWNER_NAME=YourName
OWNER_NUMBER=923001234567

# Bot Settings
BOT_PREFIX=.
BOT_NAME=LEGEND MD
BOT_MODE=public

# Auto Features
AUTO_STATUS_SEEN=true
AUTO_REACT=true
READ_MESSAGE=true

# Anti Features
ANTI_LINK=true
ANTI_LINK_KICK=true

# Group Features
WELCOME=true
GOODBYE=true

# Authentication
USE_PAIR_CODE=true
SESSION_ID=LEGEND-MD-SESSION
```

### Step 4: Start the Bot
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

---

## 🔐 Authentication (Pair Code)

The bot uses **Pair Code** authentication for security:

1. Run the bot: `npm start`
2. Get your phone number ready (with country code)
3. Enter your number when prompted
4. Check WhatsApp Settings → Account → Login with Device Code
5. Enter the code shown in terminal
6. Bot will automatically connect!

**Why Pair Code?**
- ✅ More secure than QR codes
- ✅ No account takeover risks
- ✅ Session file never exposed
- ✅ Can connect from multiple devices

---

## 📁 Project Structure

```
LEGEND-MD/
├── index.js                 # Main entry point
├── connection.js            # WhatsApp connection logic
├── config.js               # Configuration module
├── scrappers.js            # Media download functions
├── package.json            # Dependencies
├── .env                    # Environment variables
│
├── core/
│   └── WaseemCommand.js    # Base command class (with anti-tamper)
│
├── plugins/
│   ├── General/            # General commands
│   │   ├── Ping.js
│   │   ├── Menu.js
│   │   ├── Menu2.js
│   │   ├── Help.js
│   │   └── Alive.js
│   │
│   ├── Media/              # Media download commands
│   │   ├── Fb.js
│   │   ├── Ig.js
│   │   ├── Tiktok.js
│   │   └── Yt.js
│   │
│   ├── Utility/            # Utility commands
│   │   └── Sticker.js
│   │
│   ├── Group/              # Group management
│   │   └── Kick.js
│   │
│   └── Owner/              # Owner-only commands
│       └── Dev.js
│
└── README.md               # This file
```

---

## 🔒 Anti-Tamper Protection

**LEGEND MD has built-in anti-tamper security:**

### Watermark Verification
Every command output MUST contain the "Waseem" watermark. This ensures:
- ✅ Bot messages are authentic
- ✅ No unauthorized modifications
- ✅ Owner verification

### How It Works
1. Every command extends `WaseemCommand` class
2. The class wraps `conn.sendMessage()` 
3. Final messages are checked for watermark
4. Messages without watermark are rejected
5. Error is logged and command fails

### Example Command
```javascript
const response = `
Your message here...

${WATERMARK}  // Must include!
`;

await conn.sendMessage(jid, { text: response });
```

---

## ⚙️ Configuration Guide

### Owner Settings
```env
OWNER_NAME=Waseem           # Your name
OWNER_NUMBER=923001234567   # Your WhatsApp number
```

### Bot Behavior
```env
BOT_PREFIX=.                # Command prefix
BOT_NAME=LEGEND MD          # Bot name
BOT_MODE=public             # public or private
```

### Features
```env
AUTO_STATUS_SEEN=true       # Auto-read status
AUTO_REACT=true             # Auto-react to messages
READ_MESSAGE=true           # Mark as read
ANTI_LINK=true              # Remove link senders
WELCOME=true                # Welcome new members
```

---

## 📖 Creating Custom Commands

### Basic Command Template

```javascript
const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class MyCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'mycommand',
      aliases: ['my', 'cmd'],
      category: 'General',
      description: 'What does this command do',
      usage: '.mycommand [arguments]',
      reaction: {
        loading: '⏳',
        working: '🔄',
        success: '✅',
        error: '❌'
      },
      cooldown: 5,
      run: async (conn, msg, args, config) => {
        try {
          // Your command logic here
          
          const response = `
Your response...

${WATERMARK}`;  // Always include watermark!

          await conn.sendMessage(msg.key.remoteJid, {
            text: response
          });

          console.log(chalk.green('✅ Command executed'));
        } catch (error) {
          throw error;
        }
      }
    });
  }
};
```

### Placing Your Command
```
plugins/
└── General/
    └── MyCommand.js
```

The bot automatically loads all commands from the `plugins/` directory!

---

## 🐛 Troubleshooting

### Bot Won't Connect
- Check internet connection
- Verify WhatsApp account is active
- Try re-authenticating with Pair Code
- Check logs for errors

### Commands Not Working
- Verify prefix in `.env` (default: `.`)
- Check command syntax
- Ensure message contains watermark
- View console logs for errors

### Media Download Fails
- Check if URL is valid
- Verify internet connection
- Some platforms may be blocked
- Try using a VPN if needed

### Permission Denied Errors
- Ensure bot has message send permission
- In groups, make bot an admin
- Owner commands only work from owner number

---

## 📊 API Endpoints

The bot runs an Express server for health checks:

```bash
GET /              # Health check
GET /status        # Bot status and uptime
```

Example:
```bash
curl http://localhost:9090/status
```

Response:
```json
{
  "status": "online",
  "bot": "LEGEND MD",
  "uptime": 3600,
  "memory": {...},
  "timestamp": "2026-08-08T10:30:00.000Z"
}
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Waseem TechX** / **LeGenDX96**

- GitHub: [@LeGenDX96](https://github.com/LeGenDX96)
- Email: [waseemtech558@gmail.com](mailto:waseemtech558@gmail.com)

---

## ⭐ Show Your Support

Give this project a ⭐ if it helped you! Your support means a lot.

---

## 📞 Support & Contact

Need help? Have questions?

- 📧 Email: waseemtech558@gmail.com
- 💬 WhatsApp: [Contact Owner]
- 🐛 Report Issues: [GitHub Issues](https://github.com/LeGenDX96/LEGEND-MD/issues)

---

## ⚠️ Disclaimer

This bot is for educational purposes. Use responsibly and respect WhatsApp's Terms of Service. The author is not responsible for any misuse or account bans.

---

**Last Updated:** August 8, 2026

**Status:** ✅ Active & Maintained

```
╔═══════════════════════════════════════════════════╗
║  ✨ 𝐋𝐄𝐆𝐄𝐍𝐃 𝐌𝐃 ✨ WhatsApp Bot              ║
║  *Powered by* 𝗪𝗮𝘀𝗲𝗲𝗺 𝗧𝗲𝗰𝗵𝗫               ║
║  *Repository:* github.com/LeGenDX96/LEGEND-MD    ║
╚═══════════════════════════════════════════════════╝
```
