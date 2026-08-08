/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Ping Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Simple command to check bot latency and responsiveness
 * Usage: .ping
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class PingCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'ping',
      aliases: ['speed', 'pong'],
      category: 'General',
      description: 'Check bot ping and latency',
      usage: '.ping',
      reaction: {
        loading: '♻️',
        working: '🧬',
        success: '✅',
        error: '❌'
      },
      cooldown: 2,
      run: async (conn, msg, args, config) => {
        // Record start time
        const start = Date.now();

        // Send initial loading message
        await conn.sendMessage(msg.key.remoteJid, {
          text: `${this.reaction.loading} Measuring ping...`
        }, { bypassCheck: true });

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 300));

        // Calculate latency
        const latency = Date.now() - start;

        // Determine speed quality
        let speedStatus = '⚡ Excellent';
        if (latency > 500) speedStatus = '🐢 Slow';
        else if (latency > 250) speedStatus = '⚠️ Moderate';

        // Send final response with watermark
        const response = `
╔════════════════════════════════════════════════════╗
║  ${this.reaction.success} *PING RESPONSE*
╠════════════════════════════════════════════════════╣
║  ⏱️  Latency: *${latency}ms*
║  📊 Speed: *${speedStatus}*
║  🤖 Bot Status: *Online*
║  ⏰ Time: ${new Date().toLocaleTimeString()}
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

        await conn.sendMessage(msg.key.remoteJid, {
          text: response
        });

        console.log(chalk.green(`✅ Ping command executed - Latency: ${latency}ms`));
      }
    });
  }
};
