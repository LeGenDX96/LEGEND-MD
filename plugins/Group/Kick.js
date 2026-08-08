/**
 * ═══════════════════════════════════════════════════════════
 * LEGEND MD - Kick Command (Group Admin)
 * ═══════════════════════════════════════════════════════════
 * 
 * Remove a member from the group
 * Usage: .kick @user or reply to user message
 */

const WaseemCommand = require('../../core/WaseemCommand.js');
const { WATERMARK } = require('../../config.js');
const { isOwner, isAdmin, getGroupMetadata } = require('../../functions.js');
const chalk = require('chalk');

module.exports = class KickCommand extends WaseemCommand {
  constructor() {
    super({
      name: 'kick',
      aliases: ['remove', 'bye'],
      category: 'Group',
      description: 'Remove user from group (admin only)',
      usage: '.kick @user or reply to message',
      reaction: {
        loading: '⏳',
        success: '✅',
        error: '❌'
      },
      cooldown: 3,
      run: async (conn, msg, args, config) => {
        try {
          // Check if it's a group
          const isGroup = msg.key.remoteJid.endsWith('@g.us');
          if (!isGroup) {
            throw new Error('❌ This command only works in groups!');
          }

          // Get sender info
          const sender = msg.key.participant;
          const isOwnerUser = isOwner(sender, config);

          // Get group metadata
          const groupMetadata = await getGroupMetadata(conn, msg.key.remoteJid);
          if (!groupMetadata) {
            throw new Error('Could not fetch group info');
          }

          const isAdminUser = isAdmin(sender, groupMetadata);

          // Check permission
          if (!isOwnerUser && !isAdminUser) {
            throw new Error('❌ You must be a group admin to use this command!');
          }

          // Get target user
          let targetJid;

          // Check if replying to a message
          if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant;
          }
          // Check for mentions
          else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
          }
          // Check args
          else if (args.length > 0) {
            const mention = args[0].replace(/[^0-9]/g, '');
            if (mention) {
              targetJid = `${mention}@s.whatsapp.net`;
            }
          }

          if (!targetJid) {
            throw new Error(`
Please mention a user to kick!

Usage:
1. ${config.bot.prefix}kick @user
2. Reply to user's message with ${config.bot.prefix}kick`);
          }

          // Prevent kicking group admins
          const targetIsAdmin = isAdmin(targetJid, groupMetadata);
          if (targetIsAdmin) {
            throw new Error('❌ Cannot kick group admins!');
          }

          // Send warning message
          await conn.sendMessage(msg.key.remoteJid, {
            text: `
👋 *USER KICKED*

@${targetJid.split('@')[0]} has been removed from the group.

Reason: Admin action (${sender.split('@')[0]})
            `,
            mentions: [targetJid, sender]
          }, { bypassCheck: true });

          // Kick the user
          await conn.groupParticipantsUpdate(msg.key.remoteJid, [targetJid], 'remove');

          // Send confirmation
          await conn.sendMessage(msg.key.remoteJid, {
            text: `✅ Successfully kicked @${targetJid.split('@')[0]} from the group!

${WATERMARK}`,
            mentions: [targetJid]
          });

          console.log(chalk.green(`✅ User kicked from group`));

        } catch (error) {
          throw error;
        }
      }
    });
  }
};
