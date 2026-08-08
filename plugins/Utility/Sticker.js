/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Sticker Converter Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Convert images to WhatsApp stickers
 * Usage: Reply to an image with .sticker
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const chalk = require('chalk');

module.exports = class StickerCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'sticker',
      aliases: ['stick', 's'],
      category: 'Utility',
      description: 'Convert image to sticker',
      usage: 'Reply to image with .sticker',
      reaction: {
        loading: '🎨',
        working: '✏️',
        success: '✅',
        error: '❌'
      },
      cooldown: 5,
      run: async (conn, msg, args, config) => {
        try {
          // Check if message is a reply
          if (!msg.message?.imageMessage && !msg.message?.videoMessage) {
            throw new Error(`
You need to reply to an image or video! 📸

Usage:
1. Reply to an image with: ${config.bot.prefix}sticker
2. Reply to a video with: ${config.bot.prefix}sticker

Note: Videos should be under 15 seconds`);
          }

          // Send progress update
          await conn.sendMessage(msg.key.remoteJid, {
            text: `🎨 Converting to sticker...\n\n▒▒▒▒▒▒▒▒▒▒ 30%`
          }, { bypassCheck: true });

          // Download the media
          const media = msg.message.imageMessage || msg.message.videoMessage;
          let mediaBuffer;

          try {
            mediaBuffer = await conn.downloadMediaMessage(msg);
          } catch (error) {
            throw new Error('Failed to download media. Please try again.');
          }

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `🎨 Processing sticker...\n\n▓▓▓▓▓▓▒▒▒▒ 70%`
          }, { bypassCheck: true });

          // Send as sticker
          await conn.sendMessage(msg.key.remoteJid, {
            sticker: mediaBuffer
          });

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `✅ Sticker created successfully!\n\n▓▓▓▓▓▓▓▓▓▓ 100%

${WATERMARK}`
          }, { bypassCheck: true });

          console.log(chalk.green(`✅ Sticker created`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
