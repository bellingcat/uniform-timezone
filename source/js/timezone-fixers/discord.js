import HoverPopup from '../hover-popup.js';

/**
 * This script enables uniform timestamps for discord.com.
 * Timestamps handled by this script:
 *   - messages (in all channel types)
 * Timestamps not handled by this script:
 *   - message edits
 *   - forum thread overview
 */
(() => {
	console.log(
		`⏳ Discord uniform timezone content script loaded for ${
			chrome.runtime.getManifest().name
		}`,
	);

	const processed = new Set();

	const targets = [
		{
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
	];

	setInterval(() => {
		processTargets(targets, processed);
	}, 500);
})();

function processTargets(targets, processed) {
	for (const target of targets) {
		for (const node of selectNodes(target.selector, processed)) {
			try {
				// eslint-disable-next-line no-new
				new HoverPopup(target.attachTo(node), target.timestamp(node), target.url(node));
			} catch (error) {
				console.error('failed to process node:', error, node);
			} finally {
				processed.add(node);
			}
		}
	}
}

function selectNodes(selector, processed) {
	return Array.from(document.querySelectorAll(selector))
		.filter(node => !processed.has(node));
}
