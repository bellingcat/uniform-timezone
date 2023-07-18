import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for discord.com.
 * Timestamps handled by this script:
 *   - messages (in all channel types)
 * Timestamps not handled by this script:
 *   - message edits
 *   - forum thread overview
*/
const fixer = new Fixer('Discord', [
	{
		name: 'Message Timestamps',
		selector: 'time[id^="message-timestamp"]',
		attachTo: node => node,
		timestamp: node => node.getAttribute('datetime'),
		url(node) {
			// `https://discord.com/channels/{guild_id}/*`
			const guildId = window.location.href
				.split('/channels/')
				.at(-1)
				.split('/')
				.at(0);

			// `chat-messages-{channel_id}-{message_id}`
			const messageUri = node.closest('li[id^="chat-messages"]')
				.id
				.split('messages-')
				.at(-1)
				.split('-');

			const channelId = messageUri.at(0);
			const messageId = messageUri.at(1);

			return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
		},
	},
]);

fixer.start();

