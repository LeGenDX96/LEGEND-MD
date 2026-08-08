/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Help Command (Auto-loaded)
 * ═══════════════════════════════════════════════════════════
 * 
 * Generates dynamic help using loaded commands
 * Usage: .help [command-name]
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class HelpCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'help',
      aliases: ['?', 'info'],
      category: 'General',
      description: 'Get help on a specific command or all commands',
      usage: '.help [command-name]',
      reaction: {
        loading: '⏳',
        success: '✅',
        error: '❌'
      },
      cooldown: 2,
      run: async (conn, msg, args, config) => {
        try {
          // If no args, show general help
          if (args.length === 0) {
            const helpText = `
╔════════════════════════════════════════════════════╗
║       ❓ *LEGEND MD - HELP & INFORMATION*
╠════════════════════════════════════════════════════╣

*📖 How to use this bot:*

1. All commands start with: *${config.bot.prefix}*
   Example: ${config.bot.prefix}ping

2. Command format:
   ${config.bot.prefix}<command> [arguments]

3. View all commands:
   • ${config.bot.prefix}menu - Category menu
   • ${config.bot.prefix}menu2 - Complete list

4. Get specific help:
   ${config.bot.prefix}help <command-name>
   Example: ${config.bot.prefix}help fb

*⏱️ Cooldown System:*
Some commands have a cooldown timer.
Wait before using the same command again.

*🔐 Permissions:*
• Public: Anyone can use
• Owner: Only bot owner
• Admin: Group admin only
• Private: DMs only

*📞 Support:*
Contact bot owner: ${config.owner.name}

╠════════════════════════════════════════════════════╣
║  Type ${config.bot.prefix}help <command> for details
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

            await conn.sendMessage(msg.key.remoteJid, {
              text: helpText
            });
            return;
          }

          // Get specific command help
          const commandName = args[0].toLowerCase();
          
          // This would normally fetch from the commands Map loaded in connection.js
          // For now, we'll show available commands info
          const commandInfo = `
╔════════════════════════════════════════════════════╗
║  ℹ️  *COMMAND: ${commandName.toUpperCase()}*
╠════════════════════════════════════════════════════╣

To see detailed info about a command, use:
${config.bot.prefix}help <command-name>

Some popular commands:
  • ${config.bot.prefix}ping - Check bot status
  • ${config.bot.prefix}fb <url> - Download from Facebook
  • ${config.bot.prefix}menu - Show menu

Need more help? Contact the owner!

╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          await conn.sendMessage(msg.key.remoteJid, {
            text: commandInfo
          });

        } catch (error) {
          throw new Error(`Help command error: ${error.message}`);
        }

        console.log(chalk.cyan(`ℹ️ Help requested for: ${args[0] || 'general'}`));
      }
    });
  }
};
