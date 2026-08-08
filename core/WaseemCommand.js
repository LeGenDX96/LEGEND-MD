/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - WaseemCommand Base Class
 * ═══════════════════════════════════════════════════════════
 * 
 * Anti-Tamper Protection & Security Lock
 * 
 * This base class enforces ownership verification by requiring
 * every final message to contain "Waseem" watermark. This prevents
 * unauthorized modification of bot output.
 * 
 * - Intermediate messages can bypass check with { bypassCheck: true }
 * - Final replies MUST contain the watermark
 */

const chalk = require('chalk');

class WaseemCommand {
  /**
   * Initialize Command with security enforcement
   * @param {Object} config - Command configuration
   * @param {string} config.name - Command name
   * @param {Array} config.aliases - Alternative command names
   * @param {string|Object} config.reaction - Reaction emoji(s)
   * @param {string} config.description - What the command does
   * @param {string} config.usage - Example usage
   * @param {number} config.cooldown - Cooldown in seconds
   * @param {Function} config.run - Command execution function
   */
  constructor(config) {
    this.name = config.name;
    this.aliases = config.aliases || [];
    this.reaction = config.reaction || { loading: '⏳', success: '✅', error: '❌' };
    this.description = config.description || 'No description provided';
    this.usage = config.usage || `.${config.name}`;
    this.cooldown = config.cooldown || 0;
    this.category = config.category || 'General';

    // Store original run function
    const originalRun = config.run;

    /**
     * Wrapped run function with security enforcement
     * Hijacks conn.sendMessage to verify watermark presence
     */
    this.run = async (conn, msg, args, config) => {
      const originalSend = conn.sendMessage.bind(conn);
      let finalMessageSent = false;

      /**
       * Intercepted sendMessage - enforces watermark on final messages
       * @param {string} jid - Chat ID
       * @param {Object} content - Message content
       * @param {Object} opts - Options (bypassCheck for intermediate messages)
       */
      conn.sendMessage = async (jid, content, opts = {}) => {
        // Only check text messages that aren't bypassed
        if (content.text && !opts.bypassCheck && !finalMessageSent) {
          finalMessageSent = true;

          // Enforce watermark presence in final reply
          if (!content.text.includes('Waseem')) {
            const errorMsg = `
╔════════════════════════════════════════════════════╗
║  ⛔ OWNER VERIFICATION FAILED                       ║
╚════════════════════════════════════════════════════╝

Final message MUST contain "Waseem" watermark.
This is an anti-tamper protection mechanism.

${chalk.red('❌ Message rejected and not sent.')}`;

            console.error(chalk.red(errorMsg));

            throw new Error(
              `⛔ Owner Verification Failed!\n` +
              `Final message MUST contain "Waseem" (Watermark missing).`
            );
          }
        }

        // Send message with original connection
        return await originalSend(jid, content, opts);
      };

      try {
        // Execute original command logic
        const result = await originalRun.call(this, conn, msg, args, config);

        // Restore original sendMessage
        conn.sendMessage = originalSend;

        return result;
      } catch (error) {
        // Restore original sendMessage on error
        conn.sendMessage = originalSend;
        throw error;
      }
    };
  }
}

module.exports = WaseemCommand;
