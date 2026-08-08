/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Configuration Module
 * ═══════════════════════════════════════════════════════════
 * 
 * Loads environment variables and exports configuration objects
 * used throughout the bot application.
 */

const fs = require('fs');
const chalk = require('chalk');

// Load .env file if it exists
if (fs.existsSync('.env')) {
  require('dotenv').config({ path: './.env' });
}

/**
 * Convert string to boolean
 * @param {string} value - Environment variable value
 * @returns {boolean} - Boolean representation
 */
const toBool = (value) => {
  return value === 'true' || value === true;
};

/**
 * LEGEND MD Watermark/Signature
 * This signature MUST appear in every final bot message for ownership verification
 */
const WATERMARK = `
╔═══════════════════════════════════════════════════╗
║  *✨ 𝐋𝐄𝐆𝐄𝐍𝐃 𝐌𝐃 ✨* WhatsApp Bot              ║
║  *Powered by* 𝗪𝗮𝘀𝗲𝗲𝗺 𝗧𝗲𝗰𝗵𝗫               ║
║  *Repository:* github.com/LeGenDX96/LEGEND-MD    ║
╚═══════════════════════════════════════════════════╝`;

/**
 * Configuration Object
 * Contains all settings for the bot
 */
module.exports = {
  // Owner Information
  owner: {
    name: process.env.OWNER_NAME || 'Waseem',
    number: process.env.OWNER_NUMBER || '923001234567'
  },

  // Bot Settings
  bot: {
    name: process.env.BOT_NAME || 'LEGEND MD',
    prefix: process.env.BOT_PREFIX || '.',
    mode: process.env.BOT_MODE || 'public' // public or private
  },

  // Auto Features (Automatic Actions)
  auto: {
    statusSeen: toBool(process.env.AUTO_STATUS_SEEN),
    statusReact: toBool(process.env.AUTO_STATUS_REACT),
    react: toBool(process.env.AUTO_REACT),
    readMessage: toBool(process.env.READ_MESSAGE)
  },

  // Anti-Features (Security & Moderation)
  anti: {
    link: toBool(process.env.ANTI_LINK),
    delete: toBool(process.env.ANTI_DELETE),
    kick: toBool(process.env.ANTI_LINK_KICK),
    warn: parseInt(process.env.ANTI_WARN_LIMIT) || 3
  },

  // Group Management Features
  group: {
    welcome: toBool(process.env.WELCOME),
    goodbye: toBool(process.env.GOODBYE)
  },

  // Authentication Settings
  auth: {
    usePairCode: toBool(process.env.USE_PAIR_CODE),
    sessionId: process.env.SESSION_ID || 'LEGEND-MD-SESSION'
  },

  // Database Settings
  db: {
    type: process.env.DB_TYPE || 'json',
    path: './database'
  },

  // Watermark Signature (MUST be in every final reply)
  WATERMARK
};

// Log configuration on load
if (process.env.NODE_ENV !== 'test') {
  console.log(chalk.bgBlue.white.bold('\n ⚙️  CONFIGURATION LOADED '));
  console.log(chalk.cyan(`📱 Bot: ${module.exports.bot.name}`));
  console.log(chalk.cyan(`👤 Owner: ${module.exports.owner.name} (${module.exports.owner.number})`));
  console.log(chalk.cyan(`🔐 Auth: Pair Code ${module.exports.auth.usePairCode ? '✅' : '❌'}`));
  console.log(chalk.cyan(`🔒 Prefix: ${module.exports.bot.prefix}\n`));
}
