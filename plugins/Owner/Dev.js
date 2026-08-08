/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Owner Commands (Secret)
 * ═══════════════════════════════════════════════════════════
 * 
 * Secret owner-only commands for bot management
 * This file should be kept private and not shared publicly
 * 
 * Available commands:
 * - .eval <code> - Execute JavaScript
 * - .restart - Restart the bot
 * - .shutdown - Shutdown bot
 * - .getfile <path> - Read file contents
 * - .setprefix <prefix> - Change command prefix
 * 
 * Usage: .eval console.log('test')
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const { isOwner } = require('../../functions.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = class DevCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'eval',
      aliases: ['dev', 'exec', 'run'],
      category: 'Owner',
      description: 'Execute JavaScript code (Owner only)',
      usage: '.eval <code>',
      reaction: {
        loading: '⚙️',
        working: '🧬',
        success: '✅',
        error: '❌'
      },
      cooldown: 1,
      run: async (conn, msg, args, config) => {
        try {
          // Owner check is handled by connection.js
          const code = args.join(' ');

          if (!code) {
            throw new Error('Please provide code to execute!\n\nExample: .eval console.log("Hello")');
          }

          // Safety: Block dangerous operations
          const dangerousPatterns = [
            'process.exit',
            'require("child_process")',
            'exec(',
            'spawn(',
            'fork(',
            'eval(',
            '__dirname'
          ];

          for (const pattern of dangerousPatterns) {
            if (code.includes(pattern)) {
              throw new Error(`⛔ Blocked dangerous operation: ${pattern}`);
            }
          }

          // Execute code with timeout
          let result;
          const startTime = Date.now();

          try {
            result = await eval(`(async () => { return ${code} })()`);
          } catch (evalError) {
            result = evalError.message;
          }

          const executionTime = Date.now() - startTime;

          // Format result
          let output = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
          if (output.length > 1000) {
            output = output.substring(0, 1000) + '...';
          }

          const response = `
╔════════════════════════════════════════════════════╗
║  ⚙️  *CODE EXECUTION RESULT*
╠════════════════════════════════════════════════════╣
║  📝 Code:
\`\`\`javascript
${code}
\`\`\`

║  📤 Output:
\`\`\`
${output}
\`\`\`

║  ⏱️  Time: ${executionTime}ms
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          await conn.sendMessage(msg.key.remoteJid, {
            text: response
          });

          console.log(chalk.yellow(`🧬 Code executed - ${executionTime}ms`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};

/**
 * Additional Owner Commands Module
 * Contains: restart, shutdown, getfile, setprefix
 */
class OwnerCommandsModule {
  /**
   * Restart command
   */
  static createRestartCommand() {
    return class RestartCommand extends WaseemCommand {
      constructor() {
        super({
          name: 'restart',
          aliases: ['reboot', 'reset'],
          category: 'Owner',
          description: 'Restart the bot',
          usage: '.restart',
          reaction: { loading: '⏳', success: '✅', error: '❌' },
          cooldown: 5,
          run: async (conn, msg, args, config) => {
            try {
              const response = `
╔════════════════════════════════════════════════════╗
║  🔄 *BOT RESTARTING*
╠════════════════════════════════════════════════════╣
║  ⏳ Please wait...
║  The bot will be back online in a few seconds.
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

              await conn.sendMessage(msg.key.remoteJid, {
                text: response
              });

              console.log(chalk.yellow('🔄 Restart command received'));

              // Wait before restart
              setTimeout(() => {
                console.log(chalk.cyan('🔄 Restarting bot...'));
                process.exit(0);
              }, 2000);
            } catch (error) {
              throw error;
            }
          }
        });
      }
    };
  }

  /**
   * Shutdown command
   */
  static createShutdownCommand() {
    return class ShutdownCommand extends WaseemCommand {
      constructor() {
        super({
          name: 'shutdown',
          aliases: ['stop', 'bye'],
          category: 'Owner',
          description: 'Shutdown the bot',
          usage: '.shutdown',
          reaction: { loading: '⏳', success: '✅', error: '❌' },
          cooldown: 5,
          run: async (conn, msg, args, config) => {
            try {
              const response = `
╔════════════════════════════════════════════════════╗
║  👋 *BOT SHUTTING DOWN*
╠════════════════════════════════════════════════════╣
║  ⏳ Goodbye! See you later.
║  Bot will be offline now.
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

              await conn.sendMessage(msg.key.remoteJid, {
                text: response
              });

              console.log(chalk.red('👋 Shutdown command received'));

              // Wait before shutdown
              setTimeout(() => {
                console.log(chalk.red('❌ Bot shutting down...'));
                process.exit(0);
              }, 2000);
            } catch (error) {
              throw error;
            }
          }
        });
      }
    };
  }

  /**
   * Getfile command
   */
  static createGetFileCommand() {
    return class GetFileCommand extends WaseemCommand {
      constructor() {
        super({
          name: 'getfile',
          aliases: ['read', 'cat'],
          category: 'Owner',
          description: 'Read file contents',
          usage: '.getfile <file-path>',
          reaction: { loading: '📄', success: '✅', error: '❌' },
          cooldown: 2,
          run: async (conn, msg, args, config) => {
            try {
              const filePath = args.join(' ');

              if (!filePath) {
                throw new Error('Please provide a file path!\n\nExample: .getfile ./config.js');
              }

              // Security: Only allow reading from project directory
              const fullPath = path.resolve(filePath);
              const projectRoot = path.resolve(__dirname);

              if (!fullPath.startsWith(projectRoot)) {
                throw new Error('⛔ Access denied! Can only read files from project directory.');
              }

              if (!fs.existsSync(fullPath)) {
                throw new Error(`File not found: ${filePath}`);
              }

              // Read file
              let content = fs.readFileSync(fullPath, 'utf8');

              // Truncate if too long
              if (content.length > 2000) {
                content = content.substring(0, 2000) + '\n\n... (truncated)';
              }

              const response = `
╔════════════════��══════════════════════════��════════╗
║  📄 *FILE CONTENTS*
╠════════════════════════════════════════════════════╣
║  Path: ${filePath}
║  Size: ${fs.statSync(fullPath).size} bytes

\`\`\`
${content}
\`\`\`

${WATERMARK}`;

              await conn.sendMessage(msg.key.remoteJid, {
                text: response
              });

              console.log(chalk.cyan(`📄 File read: ${filePath}`));
            } catch (error) {
              throw error;
            }
          }
        });
      }
    };
  }
}

// Export the main Dev command
module.exports = DevCommand;
