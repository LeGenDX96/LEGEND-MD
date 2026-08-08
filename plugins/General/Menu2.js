/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Menu2 Command (Manual List)
 * ═══════════════════════════════════════════════════════════
 * 
 * Shows a complete manually-written command list
 * Usage: .menu2
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class Menu2Command extends WaseemCommand {
  constructor() {
    super({
      name: 'menu2',
      aliases: ['commands2', 'list'],
      category: 'General',
      description: 'Show complete command list (static)',
      usage: '.menu2',
      reaction: {
        loading: '⏳',
        success: '✅',
        error: '❌'
      },
      cooldown: 3,
      run: async (conn, msg, args, config) => {
        const commandList = `
╔════════════════════════════════════════════════════╗
║      📋 *LEGEND MD - COMPLETE COMMAND LIST*
╠════════════════════════════════════════════════════╣

*🟢 GENERAL COMMANDS*
  • .ping - Check bot latency
  • .menu - Show category menu
  • .menu2 - Show command list
  • .help - Get help on commands
  • .alive - Check if bot is online

*🔵 MEDIA COMMANDS*
  • .fb <url> - Download Facebook video
  • .ig <url> - Download Instagram media
  • .tiktok <url> - Download TikTok video
  • .yt <url> - Download YouTube video
  • .twitter <url> - Download Twitter/X media

*🟣 OWNER COMMANDS* (Owner Only)
  • .eval <code> - Execute JavaScript
  • .restart - Restart the bot
  • .shutdown - Shutdown bot
  • .getfile <path> - Get file content
  • .setprefix <char> - Change command prefix

*🟠 UTILITY COMMANDS*
  • .sticker - Convert image to sticker
  • .ocr - Read text from image
  • .qr <text> - Generate QR code
  • .base64 <text> - Encode text
  • .decode <text> - Decode base64

*🟡 GROUP COMMANDS*
  • .kick @user - Remove user from group
  • .mute - Mute group (admin only)
  • .unmute - Unmute group (admin only)
  • .promote @user - Make admin (owner only)
  • .demote @user - Remove admin (owner only)

╠════════════════════════════════════════════════════╣
║  Type ${config.bot.prefix}help <command> for detailed info
║  Example: ${config.bot.prefix}help ping
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

        // Send command list
        await conn.sendMessage(msg.key.remoteJid, {
          text: commandList
        });

        console.log(chalk.cyan('📋 Menu2 command executed'));
      }
    });
  }
};
