/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - YouTube Download Command
 * ═══════════════════════════════════════════════════════════
 * 
 * Download YouTube videos or audio
 * Usage: .yt <url> [audio/video]
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const { ytDownload, downloadVideo } = require('../../scrappers.js');
const chalk = require('chalk');

module.exports = class YtCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'yt',
      aliases: ['youtube', 'ytdl'],
      category: 'Media',
      description: 'Download YouTube videos or audio',
      usage: '.yt <url> [audio|video]',
      reaction: {
        loading: '📺',
        working: '🎬',
        success: '✅',
        error: '❌'
      },
      cooldown: 12,
      run: async (conn, msg, args, config) => {
        try {
          // Validate URL
          const url = args[0];
          const format = args[1]?.toLowerCase() || 'video';

          if (!url) {
            throw new Error(`
Drop that YouTube link! 🎬

Usage: ${config.bot.prefix}yt <url> [audio|video]

Example:
${config.bot.prefix}yt https://youtu.be/dQw4w9WgXcQ
${config.bot.prefix}yt https://youtube.com/... audio`);
          }

          // Validate it's a YouTube URL
          if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            throw new Error('❌ Please provide a valid YouTube URL!');
          }

          // Validate format
          if (!['audio', 'video'].includes(format)) {
            throw new Error('❌ Format must be "audio" or "video"');
          }

          // Change reaction to working
          await conn.sendMessage(msg.key.remoteJid, {
            react: { text: this.reaction.working, key: msg.key }
          });

          // Send progress update
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📺 Fetching YouTube info...\n\n▒▒▒▒▒▒▒▒▒▒ 10%`
          }, { bypassCheck: true });

          // Download video using scraper
          const result = await ytDownload(url);

          if (!result.success) {
            throw new Error(`Failed to download: ${result.error}`);
          }

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Downloading ${format}...\n\n▓▓▓▓▓▓▒▒▒▒ 65%`
          }, { bypassCheck: true });

          // Download the media file
          const mediaUrl = format === 'audio' ? result.audioUrl : result.videoUrl;
          if (!mediaUrl) {
            throw new Error(`❌ ${format} format not available for this video`);
          }

          const mediaBuffer = await downloadVideo(mediaUrl);

          // Update progress
          await conn.sendMessage(msg.key.remoteJid, {
            text: `📥 Finalizing...\n\n▓▓▓▓▓▓▓▓▓▓ 100%`
          }, { bypassCheck: true });

          // Prepare caption
          const caption = `
╔════════════════════════════════════════════════════╗
║  ✅ *YOUTUBE ${format.toUpperCase()} DOWNLOADED*
╠════════════════════════════════════════════════════╣
║  🎬 Title: ${result.title}
║  ⏱️  Duration: ${result.duration}
║  🎥 Quality: ${result.quality || 'Default'}
║  📱 Platform: YouTube
║  📊 Format: ${format.toUpperCase()}
╚════════════════════════════════════════════════════╝

${WATERMARK}`;

          // Send based on format
          if (format === 'audio') {
            await conn.sendMessage(msg.key.remoteJid, {
              audio: mediaBuffer,
              mimetype: 'audio/mpeg',
              ptt: false,
              fileName: `${result.title}.mp3`
            });
          } else {
            await conn.sendMessage(msg.key.remoteJid, {
              video: mediaBuffer,
              caption: caption,
              mimetype: 'video/mp4'
            });
          }

          console.log(chalk.green(`✅ YouTube ${format} downloaded - ${result.title}`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
