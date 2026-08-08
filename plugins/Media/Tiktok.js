/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - TikTok Download Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Download TikTok videos without watermark
 * Usage: .tiktok <url>
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const { tiktokDownload, downloadVideo } = require('../../scrappers.js');
const chalk = require('chalk');

module.exports = class TiktokCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'tiktok',
      aliases: ['tk', 'tiktokdl'],
      category: 'Media',
      description: 'Download TikTok videos',
      usage: '.tiktok <url>',
      reaction: {
        loading: '🎵',
        working: '⏱️',
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
That TikTok is fire! 🔥 Send me the link...

Usage: ${config.bot.prefix}tiktok <url>

Example:
${config.bot.prefix}tiktok https://www.tiktok.com/@user/video/123...`);
          }

          // Validate it's a TikTok URL
          if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com') && !url.includes('vt.tiktok.com')) {
            throw new Error('❌ Please provide a valid TikTok URL!');
          }

          // Change reaction to working
          await conn.sendMessage(msg.key.remoteJid, {
            react: { text: this.reaction.working, key: msg.key }
          });

          // Send progress update
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Fetching TikTok video...\n\n▒▒▒▒▒▒▒▒▒▒ 20%`
          }, { bypassCheck: true });

          // Download video using scraper
          const result = await tiktokDownload(url);

          if (!result.success) {
            throw new Error(`Failed to download: ${result.error}`);
          }

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Processing video...\n\n▓▓▓▓▓▓▓▒▒▒ 70%`
          }, { bypassCheck: true });

          // Download the video file
          const videoBuffer = await downloadVideo(result.videoUrl);

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Finalizing...\n\n▓▓▓▓▓▓▓▓▓▓ 100%`
          }, { bypassCheck: true });

          // Send video with caption
          const caption = `
╔════════════════════════════════════════════════════╗
║  ✅ *TIKTOK VIDEO DOWNLOADED*
╠════════════════════════════════════════════════════╣
║  👤 Creator: ${result.author}
║  📝 Description: ${result.description}
║  🎬 Platform: TikTok
║  🎵 Audio: ${result.audioUrl ? 'Included' : 'Not available'}
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          await conn.sendMessage(msg.key.remoteJid, {
            video: videoBuffer,
            caption: caption,
            mimetype: 'video/mp4'
          });

          console.log(chalk.green(`✅ TikTok video downloaded - ${result.author}`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
