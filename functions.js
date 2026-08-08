/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Helper Functions Module
 * ═══════════════════════════════════════════════════════════
 * 
 * Utility functions for checking permissions, formatting data,
 * and detecting link platforms.
 */

const chalk = require('chalk');

/**
 * Check if sender is the bot owner
 * @param {string} sender - Sender's JID/number
 * @param {Object} config - Bot configuration
 * @returns {boolean} - True if sender is owner
 */
const isOwner = (sender, config) => {
  if (!sender || !config.owner) return false;

  // Extract number from JID (e.g., "923001234567@s.whatsapp.net" → "923001234567")
  const senderNumber = sender.split('@')[0];
  const ownerNumber = config.owner.number.toString();

  return senderNumber === ownerNumber;
};

/**
 * Check if sender is an admin in group
 * @param {string} sender - Sender's JID/number
 * @param {Object} groupMetadata - Group metadata from Baileys
 * @returns {boolean} - True if sender is admin
 */
const isAdmin = (sender, groupMetadata) => {
  if (!groupMetadata || !groupMetadata.participants) return false;

  const participant = groupMetadata.participants.find(p => p.id === sender);
  return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
};

/**
 * Check if sender is a buddy (trusted user)
 * @param {string} sender - Sender's JID/number
 * @param {Object} config - Bot configuration
 * @returns {boolean} - True if sender is in buddy list
 */
const isBuddy = (sender, config) => {
  if (!config.buddies || !Array.isArray(config.buddies)) return false;

  const senderNumber = sender.split('@')[0];
  return config.buddies.includes(senderNumber);
};

/**
 * Fetch group metadata
 * @param {Object} conn - Baileys connection object
 * @param {string} jid - Group JID
 * @returns {Promise<Object|null>} - Group metadata or null
 */
const getGroupMetadata = async (conn, jid) => {
  try {
    const metadata = await conn.groupMetadata(jid);
    return metadata;
  } catch (error) {
    console.error(chalk.red(`❌ Error fetching group metadata: ${error.message}`));
    return null;
  }
};

/**
 * Convert bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Sleep/delay promise
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Detect link platform from URL
 * @param {string} url - URL to analyze
 * @returns {string|null} - Platform name or null
 */
const getLinkPlatform = (url) => {
  if (!url || typeof url !== 'string') return null;

  const urlLower = url.toLowerCase();

  // Platform patterns
  const platforms = {
    facebook: ['facebook.com', 'fb.com', 'fb.watch'],
    instagram: ['instagram.com', 'instagr.am'],
    youtube: ['youtube.com', 'youtu.be'],
    tiktok: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
    twitter: ['twitter.com', 'x.com'],
    linkedin: ['linkedin.com'],
    reddit: ['reddit.com'],
    whatsapp: ['whatsapp.com'],
    telegram: ['telegram.me', 'telegram.dog', 't.me'],
    pinterest: ['pinterest.com'],
    snapchat: ['snapchat.com'],
    twitch: ['twitch.tv'],
    discord: ['discord.com', 'discord.gg'],
    github: ['github.com']
  };

  for (const [platform, domains] of Object.entries(platforms)) {
    for (const domain of domains) {
      if (urlLower.includes(domain)) {
        return platform;
      }
    }
  }

  return null; // Unknown platform
};

/**
 * Extract URLs from text
 * @param {string} text - Text to search
 * @returns {Array<string>} - Array of found URLs
 */
const extractUrls = (text) => {
  if (!text || typeof text !== 'string') return [];

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex) || [];

  return matches.map(url => url.replace(/[.,;!?]$/, '')); // Remove trailing punctuation
};

/**
 * Format time duration in human readable format
 * @param {number} ms - Milliseconds
 * @returns {string} - Formatted string (e.g., "2h 30m 45s")
 */
const formatTime = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let result = '';

  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  if (seconds > 0) result += `${seconds}s`;

  return result.trim() || '0s';
};

/**
 * Get user display name from JID
 * @param {string} jid - User's JID
 * @param {Object} conn - Baileys connection
 * @returns {Promise<string>} - Display name or number
 */
const getUserName = async (jid, conn) => {
  try {
    if (!jid) return 'Unknown';

    const contact = await conn.fetchStatus(jid).catch(() => null);
    if (contact && contact.name) return contact.name;

    // Fallback to stored contact
    const contacts = await conn.contacts;
    if (contacts[jid] && contacts[jid].name) return contacts[jid].name;

    // Last resort: extract number
    return jid.split('@')[0];
  } catch (error) {
    return jid.split('@')[0];
  }
};

/**
 * Validate WhatsApp number format
 * @param {string} number - Phone number
 * @returns {boolean} - True if valid format
 */
const isValidNumber = (number) => {
  const cleaned = number.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

module.exports = {
  isOwner,
  isAdmin,
  isBuddy,
  getGroupMetadata,
  formatBytes,
  sleep,
  getLinkPlatform,
  extractUrls,
  formatTime,
  getUserName,
  isValidNumber
};
