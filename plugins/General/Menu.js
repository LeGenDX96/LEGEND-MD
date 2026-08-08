/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Menu Command (Category-based)
 * ═══════════════════════════════════════════════════════════
 * 
 * Shows main menu with command categories
 * Usage: .menu
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class MenuCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'menu',
      aliases: ['help', 'commands'],
      category: 'General',
      description: 'Show bot menu with command categories',
      usage: '.menu',
      reaction: {
        loading: '⏳',
        success: '✅',
        error: '❌'
      },
      cooldown: 3,
      run: async (conn, msg, args, config) => {
        // Menu categories with descriptions
        const menuText = `
╔════════════════════════════════════════════════════╗
║         ✨ *LEGEND MD MAIN MENU* ✨
╠════════════════════════════════════════════════════╣
║
║  1️⃣  *General Commands*
║     └─ Basic bot commands (ping, help, menu)
║
║  2️⃣  *Media Commands*
║     └─ Download videos (FB, IG, TikTok, YT)
║
║  3️⃣  *Owner Commands*
║     └─ Admin-only commands (eval, restart)
║
║  4️⃣  *Utility Commands*
║     └─ Tools & utilities (text, image, tools)
║
║  5️⃣  *Group Commands*
║     └─ Group management (kick, mute, warn)
║
╠════════════════════════════════════════════════════╣
║  📝 Reply with a number to see category commands
║  🔍 Or use .help <command> for specific help
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

        // Send menu
        await conn.sendMessage(msg.key.remoteJid, {
          image: { url: 'https://via.placeholder.com/1080x400?text=LEGEND+MD+Commands' },
          caption: menuText
        });

        console.log(chalk.cyan('📋 Menu command executed'));
      }
    });
  }
};
