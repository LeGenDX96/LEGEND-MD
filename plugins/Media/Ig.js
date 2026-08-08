/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Instagram Download Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Download photos, videos, and reels from Instagram
 * Usage: .ig <url>
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const { instaDownload, downloadImage } = require('../../scrappers.js');
const chalk = require('chalk');

module.exports = class IgCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'ig',
      aliases: ['instagram', 'igdl'],
      category: 'Media',
      description: 'Download Instagram photos/videos/reels',
      usage: '.ig <url>',
      reaction: {
        loading: '📷',
        working: '🔄',
        success: '✅',
        error: '❌'
      },
      cooldown: 8,
      run: async (conn, msg, args, config) => {
        try {
          // Validate URL
          const url = args[0];
          if (!url) {
            throw new Error(`
Share that Instagram post with me! 😎

Usage: ${config.bot.prefix}ig <url>

Example:
${config.bot.prefix}ig https://www.instagram.com/p/ABC123...`);
          }

          // Validate it's an Instagram URL
          if (!url.includes('instagram.com') && !url.includes('instagr.am')) {
            throw new Error('❌ Please provide a valid Instagram URL!');
          }

          // Change reaction to working
          await conn.sendMessage(msg.key.remoteJid, {
            react: { text: this.reaction.working, key: msg.key }
          });

          // Send progress update
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Fetching Instagram media...\n\n▒▒▒▒▒▒▒▒▒▒ 15%`
          }, { bypassCheck: true });

          // Download media using scraper
          const result = await instaDownload(url);

          if (!result.success) {
            throw new Error(`Failed to download: ${result.error}`);
          }

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Processing media...\n\n▓▓▓▓▓▓▒▒▒▒ 60%`
          }, { bypassCheck: true });

          // Download the image/media
          const mediaBuffer = await downloadImage(result.mediaUrl);

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Finalizing...\n\n▓▓▓▓▓▓▓▓▓▓ 100%`
          }, { bypassCheck: true });

          // Send media with caption
          const caption = `
╔════════════════════════════════════════════════════╗
║  ✅ *INSTAGRAM MEDIA DOWNLOADED*
╠════════════════════════════════════════════════════╣
║  👤 Author: ${result.author}
║  📝 Caption: ${result.caption}
║  🎬 Type: ${result.type}
║  📱 Platform: Instagram
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          // Send based on media type
          if (result.type === 'video' || result.type === 'reel') {
            await conn.sendMessage(msg.key.remoteJid, {
              video: mediaBuffer,
              caption: caption,
              mimetype: 'video/mp4'
            });
          } else {
            await conn.sendMessage(msg.key.remoteJid, {
              image: mediaBuffer,
              caption: caption
            });
          }

          console.log(chalk.green(`✅ Instagram media downloaded - ${result.type}`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
