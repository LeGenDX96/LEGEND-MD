/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Alive Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Check if bot is alive and show status
 * Usage: .alive
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class AliveCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'alive',
      aliases: ['online', 'status'],
      category: 'General',
      description: 'Check if bot is alive',
      usage: '.alive',
      reaction: {
        loading: '⏳',
        success: '✅',
        error: '❌'
      },
      cooldown: 3,
      run: async (conn, msg, args, config) => {
        try {
          const uptime = process.uptime();
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);

          const memUsage = process.memoryUsage();
          const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);

          const response = `
╔════════════════════════════════════════════════════╗
║  ✅ *BOT IS ALIVE AND RUNNING*
╠════════════════════════════════════════════════════╣
║
║  🤖 Bot Name: ${config.bot.name}
║  👤 Owner: ${config.owner.name}
║  📱 WhatsApp Connected: Yes ✅
║
║  ⏱️  Uptime: ${hours}h ${minutes}m ${seconds}s
║  💾 Memory Usage: ${memUsageMB}MB
║  🔧 Prefix: ${config.bot.prefix}
║  🎯 Mode: ${config.bot.mode}
║  ⚡ Status: Online 🟢
║
║  📊 Features:
║     • Auto Status: ${config.auto.statusSeen ? '✅' : '❌'}
║     • Auto React: ${config.auto.react ? '✅' : '❌'}
║     • Anti-Link: ${config.anti.link ? '✅' : '❌'}
║     • Welcome: ${config.group.welcome ? '✅' : '❌'}
║
║  ⏰ Current Time: ${new Date().toLocaleString()}
║
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          await conn.sendMessage(msg.key.remoteJid, {
            image: { url: 'https://via.placeholder.com/1080x400?text=LEGEND+MD+Online' },
            caption: response
          });

          console.log(chalk.green(`✅ Alive check - Uptime: ${hours}h ${minutes}m ${seconds}s`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
