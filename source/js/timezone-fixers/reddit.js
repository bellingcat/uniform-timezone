import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for reddit.com.
 * Timestamps handled by this script:
 *   - posts (new and old Reddit)
 *   - comments (new and old Reddit)
 * Timestamps not handled by this script:
 *   - DMs/chat (rendered inside web components, not reachable by content scripts)
*/
const fixer = new Fixer('Reddit', [
	{
		name: 'New Reddit Timestamps',
		selector: 'faceplate-timeago, faceplate-date',
		attachTo: node => node,
		timestamp: node => node.getAttribute('ts'),
		url(node) {
			const link = node.closest('a');
			if (link?.href) {
				return link.href;
			}

			const redditElement = node.closest('shreddit-post, shreddit-comment, shreddit-profile-comment');
			const path = redditElement?.getAttribute('permalink') || redditElement?.getAttribute('href');
			if (path) {
				try {
					return new URL(path, window.location.origin).href;
				} catch {
					return window.location.href;
				}
			}

			return window.location.href;
		},
	},
	{
		name: 'Old Reddit Timestamps',
		selector: 'time.live-timestamp',
		attachTo: node => node,
		timestamp: node => node.getAttribute('datetime'),
		url(node) {
			const thing = node.closest('.thing');
			if (thing?.dataset.permalink) {
				return new URL(thing.dataset.permalink, window.location.origin).href;
			}

			return node.closest('a')?.href ?? window.location.href;
		},
	},
]);

fixer.start();
