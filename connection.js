/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Main Connection & Message Handler
 * ═══════════════════════════════════════════════════════════
 * 
 * This file handles all WhatsApp connection logic using Baileys,
 * loads all commands, and implements the message handler with:
 * - Pair Code authentication (NO QR CODE)
 * - Beautiful terminal output using Chalk
 * - Command execution with cooldown system
 * - Anti-link detection and enforcement
 * - Auto status viewing and reacting
 * - Message read receipts
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');

const config = require('./config.js');
const { isOwner, isAdmin, isBuddy, getGroupMetadata, getLinkPlatform, extractUrls, formatTime } = require('./functions.js');

// Global command cooldown storage
const cooldowns = new Map();
const userWarnings = new Map(); // For anti-link warnings
const commands = new Map();

/**
 * Load all command files from plugins directory
 * Recursively searches all subfolders and loads .js files
 */
const loadCommands = async () => {
  const spinner = ora(chalk.cyan('🧬 Loading Plugins...')).start();

  try {
    const pluginsPath = path.join(__dirname, 'plugins');

    if (!fs.existsSync(pluginsPath)) {
      fs.mkdirSync(pluginsPath, { recursive: true });
      spinner.warn(chalk.yellow('📁 Created plugins directory - add commands there'));
      return;
    }

    let commandCount = 0;
    const loadFromDir = (dir) => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively load from subdirectories
          loadFromDir(filePath);
        } else if (file.endsWith('.js')) {
          try {
            // Clear require cache to reload
            delete require.cache[require.resolve(filePath)];

            const CommandClass = require(filePath);
            const command = new CommandClass();

            // Register command and aliases
            commands.set(command.name.toLowerCase(), command);
            if (command.aliases && Array.isArray(command.aliases)) {
              command.aliases.forEach(alias => {
                commands.set(alias.toLowerCase(), command);
              });
            }

            commandCount++;
            console.log(chalk.green(`  ✅ ${command.name}`));
          } catch (error) {
            console.error(chalk.red(`  ❌ Error loading ${file}: ${error.message}`));
          }
        }
      }
    };

    loadFromDir(pluginsPath);

    spinner.succeed(chalk.green(`✅ Loaded ${commandCount} commands`));
    return commandCount;
  } catch (error) {
    spinner.fail(chalk.red(`Failed to load commands: ${error.message}`));
    return 0;
  }
};

/**
 * Check if user is on cooldown for a command
 * @param {string} userId - User's JID
 * @param {string} commandName - Command name
 * @param {number} cooldownSeconds - Cooldown duration
 * @returns {Object} - { onCooldown: boolean, remainingMs: number }
 */
const checkCooldown = (userId, commandName, cooldownSeconds) => {
  const key = `${userId}-${commandName}`;
  const now = Date.now();

  if (!cooldowns.has(key)) {
    cooldowns.set(key, now);
    return { onCooldown: false, remainingMs: 0 };
  }

  const expirationTime = cooldowns.get(key) + cooldownSeconds * 1000;
  const remainingMs = expirationTime - now;

  if (remainingMs > 0) {
    return { onCooldown: true, remainingMs };
  }

  cooldowns.set(key, now);
  return { onCooldown: false, remainingMs: 0 };
};

/**
 * Handle anti-link detection in groups
 */
const handleAntiLink = async (conn, msg, config, groupMetadata) => {
  if (!config.anti.link) return; // Feature disabled

  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  const urls = extractUrls(text);

  if (urls.length === 0) return; // No URLs found

  const sender = msg.key.participant;
  const isOwnerUser = isOwner(sender, config);
  const isAdminUser = isAdmin(sender, groupMetadata);

  // Skip check for owner and admin
  if (isOwnerUser || isAdminUser) return;

  // User is not owner/admin - check links
  for (const url of urls) {
    const platform = getLinkPlatform(url);

    // Allowed platforms
    const allowedPlatforms = ['youtube', 'github', 'linkedin'];

    if (platform && allowedPlatforms.includes(platform)) {
      continue; // This platform is allowed
    }

    // Unknown or restricted platform - warn user
    let warnings = userWarnings.get(sender) || 0;
    warnings++;
    userWarnings.set(sender, warnings);

    const remainingWarns = Math.max(0, config.anti.warn - warnings);

    // Send warning message
    await conn.sendMessage(msg.key.remoteJid, {
      text: `
⚠️ *ANTI-LINK WARNING* ⚠️

@${sender.split('@')[0]}, unknown platform link detected!

${platform ? `Platform: *${platform}*` : 'Unknown platform'}

🚫 Don't send links in this group for safety.
⏱️ Warnings remaining: *${remainingWarns}*

${remainingWarns === 0 ? '❌ Next violation = KICK!' : ''}
      `,
      mentions: [sender]
    }, { bypassCheck: true });

    // Kick if warnings exceeded
    if (warnings >= config.anti.warn && config.anti.kick) {
      const groupName = groupMetadata.subject || 'Group';

      // Send goodbye message
      await conn.sendMessage(msg.key.remoteJid, {
        text: `
👋 *USER REMOVED*

We are sorry @${sender.split('@')[0]}, but you violated our group privacy and policy.

You are being removed from *${groupName}*.

We hope you will join us again soon! 🙏
        `,
        mentions: [sender]
      }, { bypassCheck: true });

      // Remove user from group
      await conn.groupParticipantsUpdate(msg.key.remoteJid, [sender], 'remove').catch(() => {});

      // Reset warnings
      userWarnings.delete(sender);
    }

    return; // Stop processing after first violation
  }
};

/**
 * Main WhatsApp connection function
 * Uses Pair Code authentication (NO QR CODE)
 */
const connectToWA = async () => {
  try {
    console.clear();

    // Display beautiful banner
    console.log(
      chalk.magenta(
        figlet.textSync('LEGEND MD', {
          horizontalLayout: 'default',
          verticalLayout: 'default'
        })
      )
    );

    console.log(chalk.cyan('═════════════════════════════════════════════════'));
    console.log(chalk.cyan('🤖 WhatsApp Bot - Powered by Waseem TechX'));
    console.log(chalk.cyan('═════════════════════════════════════════════════\n'));

    // Setup authentication with multi-file state
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    // Create socket
    const conn = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false, // ← NO QR CODE!
      logger: require('pino')({ level: 'silent' }), // Suppress debug logs
      browser: ['LEGEND MD', 'Chrome', '120.0'],
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: true,
      maxMsgsInMemory: 100
    });

    /**
     * Handle connection updates (including Pair Code)
     */
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, pairingCode } = update;

      // Display Pair Code (NEW AUTH METHOD - NO QR)
      if (pairingCode) {
        console.log(
          chalk.bgGreen.black.bold('\n 🔐 PAIRING CODE (PAIR THIS IN 60 SECONDS) \n')
        );
        console.log(chalk.yellow(`\n   ${chalk.bold(pairingCode)}\n`));
        console.log(chalk.cyan('   Open WhatsApp → Settings → Linked Devices'));
        console.log(chalk.cyan('   → Use Phone Number → Enter code above\n'));
      }

      if (connection === 'connecting') {
        console.log(chalk.blue('🔄 Connecting to WhatsApp...'));
      }

      if (connection === 'open') {
        console.log(chalk.bgGreen.black.bold('\n ✅ CONNECTED TO WHATSAPP \n'));
        console.log(chalk.green(`👤 Logged in as: ${conn.user.name}`));
        console.log(chalk.green(`📱 WhatsApp ID: ${conn.user.id}\n`));

        // Load commands after connection
        const cmdCount = await loadCommands();
        console.log(chalk.bgBlue.white.bold('\n ⚙️  BOT READY \n'));
        console.log(chalk.cyan(`Total Commands: ${cmdCount}`));
        console.log(chalk.cyan(`Prefix: ${config.bot.prefix}`));
        console.log(chalk.cyan(`Mode: ${config.bot.mode}`));
        console.log(chalk.cyan(`Auto Status: ${config.auto.statusSeen ? '✅' : '❌'}`));
        console.log(chalk.cyan(`Anti-Link: ${config.anti.link ? '✅' : '❌'}\n`));

        // Send welcome message to owner
        try {
          const ownerJid = `${config.owner.number}@s.whatsapp.net`;
          await conn.sendMessage(ownerJid, {
            image: { url: 'https://via.placeholder.com/1080x400?text=LEGEND+MD+Bot' },
            caption: `
╔════════════════════════════════════════════════════╗
║  ✅ *LEGEND MD BOT STARTED SUCCESSFULLY*           ║
╠══════════════════════════════��═════════════════════╣
║  🤖 Bot: ${config.bot.name}
║  👤 Owner: ${config.owner.name}
║  📱 Number: ${config.owner.number}
║  ⏰ Time: ${new Date().toLocaleString()}
║  📊 Commands Loaded: ${cmdCount}
╚════════════════════════════════════════════════════╝

Use ${config.bot.prefix}menu to view all commands.
            `
          }).catch(() => {});
        } catch (error) {
          console.error(chalk.red(`⚠️ Could not send welcome: ${error.message}`));
        }
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log(
          chalk.red(`\n❌ Connection Closed - ${lastDisconnect?.error?.message || 'Unknown reason'}\n`)
        );

        if (shouldReconnect) {
          console.log(chalk.yellow('🔄 Reconnecting in 5 seconds...\n'));
          setTimeout(() => connectToWA(), 5000);
        } else {
          console.log(chalk.red('You have been logged out. Delete auth_info folder to login again.\n'));
          process.exit(0);
        }
      }
    });

    /**
     * Save credentials whenever they update
     */
    conn.ev.on('creds.update', saveCreds);

    /**
     * Main message handler
     */
    conn.ev.on('messages.upsert', async (m) => {
      try {
        const msg = m.messages[0];

        if (!msg.message) return; // Empty message
        if (msg.key.fromMe) return; // Ignore own messages
        if (msg.key.remoteJid === 'status@broadcast') {
          // Handle auto status viewing
          if (config.auto.statusSeen) {
            await conn.readMessages([msg.key]).catch(() => {});
          }
          if (config.auto.statusReact) {
            const reactions = ['👍', '❤️', '😂', '🔥', '😍'];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            await conn.sendMessage(msg.key.remoteJid, {
              react: { text: randomReaction, key: msg.key }
            }).catch(() => {});
          }
          return;
        }

        // Extract text and sender
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const isOwnerUser = isOwner(sender, config);

        // Auto-react feature
        if (config.auto.react && !text.startsWith(config.bot.prefix)) {
          const reactions = ['👀', '😊', '🎯', '💯'];
          const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
          await conn.sendMessage(msg.key.remoteJid, {
            react: { text: randomReaction, key: msg.key }
          }).catch(() => {});
        }

        // Read message
        if (config.auto.readMessage) {
          await conn.readMessages([msg.key]).catch(() => {});
        }

        // Check for command prefix
        if (!text.startsWith(config.bot.prefix)) return;

        // Extract command and arguments
        const args = text.slice(config.bot.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const command = commands.get(commandName);

        if (!command) return; // Command not found

        // Owner-only command protection
        if (command.category === 'Owner' && !isOwnerUser && !isBuddy(sender, config)) {
          await conn.sendMessage(msg.key.remoteJid, {
            text: `⛔ *Access Denied*\n\nThis command is only for the bot owner.`,
            mentions: [sender]
          }, { bypassCheck: true });
          return;
        }

        // Check cooldown
        const cooldownCheck = checkCooldown(sender, commandName, command.cooldown);
        if (cooldownCheck.onCooldown) {
          const remaining = formatTime(cooldownCheck.remainingMs);
          await conn.sendMessage(msg.key.remoteJid, {
            text: `⏳ *Cooldown Active*\n\nWait ${remaining} before using this command again.`,
            mentions: [sender]
          }, { bypassCheck: true });
          return;
        }

        // Send loading reaction
        if (command.reaction) {
          const loadingEmoji = typeof command.reaction === 'string' ? command.reaction : (command.reaction.loading || '⏳');
          await conn.sendMessage(msg.key.remoteJid, {
            react: { text: loadingEmoji, key: msg.key }
          }).catch(() => {});
        }

        try {
          // Execute command
          await command.run(conn, msg, args, config);

          // Send success reaction
          if (command.reaction && typeof command.reaction === 'object') {
            await conn.sendMessage(msg.key.remoteJid, {
              react: { text: command.reaction.success || '✅', key: msg.key }
            }).catch(() => {});
          }
        } catch (error) {
          console.error(chalk.red(`❌ Command Error (${commandName}): ${error.message}`));

          // Send error reaction
          if (command.reaction && typeof command.reaction === 'object') {
            await conn.sendMessage(msg.key.remoteJid, {
              react: { text: command.reaction.error || '❌', key: msg.key }
            }).catch(() => {});
          }

          // Send error message
          await conn.sendMessage(msg.key.remoteJid, {
            text: `
❌ *Command Error*

${error.message}
            `,
            mentions: [sender]
          }, { bypassCheck: true }).catch(() => {});
        }

        // Handle anti-link in groups
        if (isGroup) {
          try {
            const groupMetadata = await getGroupMetadata(conn, msg.key.remoteJid);
            if (groupMetadata) {
              await handleAntiLink(conn, msg, config, groupMetadata);
            }
          } catch (error) {
            console.error(chalk.red(`⚠️ Anti-link error: ${error.message}`));
          }
        }
      } catch (error) {
        console.error(chalk.red(`Message handler error: ${error.message}`));
      }
    });
  } catch (error) {
    console.error(chalk.red(`Connection error: ${error.message}`));
    console.log(chalk.yellow('Retrying in 10 seconds...'));
    setTimeout(() => connectToWA(), 10000);
  }
};

module.exports = { connectToWA };
