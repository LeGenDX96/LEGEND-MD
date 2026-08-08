/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Facebook Download Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Download videos from Facebook with quality selection
 * Usage: .fb <video-url>
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const { fbDownload, downloadVideo } = require('../../scrappers.js');
const chalk = require('chalk');

module.exports = class FbCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'fb',
      aliases: ['facebook', 'fbdl'],
      category: 'Media',
      description: 'Download Facebook video',
      usage: '.fb <url>',
      reaction: {
        loading: '📩',
        working: '📶',
        success: '✅',
        error: '❌'
      },
      cooldown: 10,
      run: async (conn, msg, args, config) => {
        try {
          // Validate URL
          const url = args[0];
          if (!url) {
            throw new Error(`
Don't waste my time... 😅

Please provide a Facebook video URL:
${config.bot.prefix}fb <url>

Example:
${config.bot.prefix}fb https://www.facebook.com/video.php?v=123456`);
          }

          // Validate it's a Facebook URL
          if (!url.includes('facebook.com') && !url.includes('fb.com')) {
            throw new Error('❌ Please provide a valid Facebook video URL!');
          }

          // Change reaction to working
          await conn.sendMessage(msg.key.remoteJid, {
            react: { text: this.reaction.working, key: msg.key }
          });

          // Send progress update
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Fetching video information...\n\n▒▒▒▒▒▒▒▒▒▒ 10%`
          }, { bypassCheck: true });

          // Download video using scraper
          const result = await fbDownload(url);

          if (!result.success) {
            throw new Error(`Failed to download: ${result.error}`);
          }

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Downloading video...\n\n▓▓▓▓▓▓▓▓▒▒ 80%`
          }, { bypassCheck: true });

          // Download the video file
          const videoBuffer = await downloadVideo(result.videoUrl);

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Finalizing...\n\n▓▓▓▓▓▓▓▓▓▓ 100%`
          }, { bypassCheck: true });

          // Send video with watermark caption
          const caption = `
╔════════════════════════════════════════════════════╗
║  ✅ *VIDEO DOWNLOADED SUCCESSFULLY*
╠════════════════════════════════════════════════════╣
║  📹 Title: ${result.title}
║  ⏱️  Duration: ${result.duration}
║  🎬 Quality: ${result.quality}
║  📊 Platform: Facebook
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          await conn.sendMessage(msg.key.remoteJid, {
            video: videoBuffer,
            caption: caption,
            mimetype: 'video/mp4'
          });

          console.log(chalk.green(`✅ Facebook video downloaded - ${result.title}`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
