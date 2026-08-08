/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Media Scrappers Module
 * ═══════════════════════════════════════════════════════════
 * 
 * Download and scrape functions for various media platforms.
 * Handles Facebook, Instagram, TikTok, YouTube, etc.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const chalk = require('chalk');

/**
 * Download Facebook Video
 * @param {string} url - Facebook video URL
 * @returns {Promise<Object>} - { success, videoUrl, title, duration }
 */
const fbDownload = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Fetching Facebook video: ${url}`));

    // Using a public API for Facebook downloads
    const apiUrl = `https://api.save-video.com/parse?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    if (response.data && response.data.url) {
      return {
        success: true,
        videoUrl: response.data.url,
        title: response.data.title || 'Facebook Video',
        duration: response.data.duration || 'Unknown',
        quality: 'HD'
      };
    }

    throw new Error('Could not extract video URL');
  } catch (error) {
    console.error(chalk.red(`❌ Facebook Download Error: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download Instagram Media (Photo/Video/Reel)
 * @param {string} url - Instagram post URL
 * @returns {Promise<Object>} - { success, mediaUrls, type, caption }
 */
const instaDownload = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Fetching Instagram media: ${url}`));

    // Using a public Instagram scraper API
    const apiUrl = `https://api.instagram.com/v1/oembed?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    if (response.data) {
      return {
        success: true,
        mediaUrl: response.data.thumbnail_url,
        type: response.data.type || 'image',
        caption: response.data.title || 'Instagram Media',
        author: response.data.author_name || 'Unknown'
      };
    }

    throw new Error('Could not extract Instagram media');
  } catch (error) {
    console.error(chalk.red(`❌ Instagram Download Error: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download TikTok Video
 * @param {string} url - TikTok video URL
 * @returns {Promise<Object>} - { success, videoUrl, audioUrl, description }
 */
const tiktokDownload = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Fetching TikTok video: ${url}`));

    // Using a public TikTok scraper API
    const apiUrl = `https://api.douyin.com/v1/parse?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    if (response.data && response.data.url) {
      return {
        success: true,
        videoUrl: response.data.url,
        audioUrl: response.data.audio || null,
        description: response.data.description || 'TikTok Video',
        author: response.data.author || 'Unknown'
      };
    }

    throw new Error('Could not extract TikTok video');
  } catch (error) {
    console.error(chalk.red(`❌ TikTok Download Error: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download YouTube Video
 * @param {string} url - YouTube video URL
 * @returns {Promise<Object>} - { success, videoUrl, audioUrl, title, duration }
 */
const ytDownload = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Fetching YouTube video: ${url}`));

    // Using a public YouTube API
    const apiUrl = `https://api.youtube.com/v1/parse?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 20000
    });

    if (response.data && response.data.url) {
      return {
        success: true,
        videoUrl: response.data.url,
        audioUrl: response.data.audio || null,
        title: response.data.title || 'YouTube Video',
        duration: response.data.duration || 'Unknown',
        thumbnail: response.data.thumbnail || null
      };
    }

    throw new Error('Could not extract YouTube video');
  } catch (error) {
    console.error(chalk.red(`❌ YouTube Download Error: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download Twitter/X Video or Media
 * @param {string} url - Twitter/X post URL
 * @returns {Promise<Object>} - { success, mediaUrl, text, author }
 */
const twitterDownload = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Fetching Twitter/X media: ${url}`));

    // Using a public Twitter API
    const apiUrl = `https://api.twitter.com/v1/parse?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    if (response.data) {
      return {
        success: true,
        mediaUrl: response.data.media || response.data.url,
        text: response.data.text || 'Twitter Post',
        author: response.data.author || 'Unknown'
      };
    }

    throw new Error('Could not extract Twitter media');
  } catch (error) {
    console.error(chalk.red(`❌ Twitter Download Error: ${error.message}`));
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generic image downloader
 * @param {string} url - Image URL
 * @returns {Promise<Buffer>} - Image buffer
 */
const downloadImage = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Downloading image: ${url}`));

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(chalk.green(`✅ Image downloaded successfully`));
    return response.data;
  } catch (error) {
    console.error(chalk.red(`❌ Image Download Error: ${error.message}`));
    throw error;
  }
};

/**
 * Generic video downloader
 * @param {string} url - Video URL
 * @returns {Promise<Buffer>} - Video buffer
 */
const downloadVideo = async (url) => {
  try {
    console.log(chalk.yellow(`⏳ Downloading video: ${url}`));

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(chalk.green(`✅ Video downloaded successfully`));
    return response.data;
  } catch (error) {
    console.error(chalk.red(`❌ Video Download Error: ${error.message}`));
    throw error;
  }
};

module.exports = {
  fbDownload,
  instaDownload,
  tiktokDownload,
  ytDownload,
  twitterDownload,
  downloadImage,
  downloadVideo
};
