import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for tiktok.com.
 * Timestamps handled by this script:
 *   - Individual video page -> hover over username
 *   - User page video thumbnails -> hover over username/date
 *   - /explore feed page -> hover over username/date
 *   - /foryou feed page -> hover over username/date
 * Timestamps not handled by this script:
 *   - "you may like" thumbnails -> is it possible to do it for the "you may like" section on the right side of a video page? there is no id in the html but perhaps the click event listener could somehow be intercepted/mocked.
 */

const fixer = new Fixer('TikTok', [
	{
		// Example: https://www.tiktok.com/@stephanie_sslx/video/7251522999810051336
		name: 'Maximized video page -> hover over username',
		selector: 'span[data-e2e="browser-nickname"]',
		attachTo: node => node,
		timestamp: _ => extractDateFromId(getVidId()),
		url: _ => window.location.href,
	},
	{
		// Example: https://www.tiktok.com/@nhuandaocalligraphy or https://www.tiktok.com/explore
		name: 'User page video thumbnails AND for the /explore thumbnails page',
		selector: 'div[data-e2e="user-post-item-desc"],div[data-e2e="explore-item"]',
		attachTo: node => node.parentNode.querySelector('div[data-e2e="explore-card-desc"]') || node.parentNode.querySelector('div[data-e2e="user-post-item-desc"]'),
		timestamp(node) {
			const vidUrl = node.querySelector('a')?.href;
			if (!vidUrl) {
				throw new Error(`Unable to get video id from node ${node}`);
			}

			return extractDateFromId(getVidId(vidUrl));
		},
		url: node => node.querySelector('a')?.href,
	},
	{
		// Example: https://www.tiktok.com/foryou
		name: 'Feed pages',
		selector: 'div[id^="xgwrapper-0-"]',
		attachTo: node => node.closest('[class*="DivContentContainer"]').querySelector('[class*=\'DivTextInfoContainer\']'),
		timestamp: node => extractDateFromId(node.getAttribute('id').replace('xgwrapper-0-', '')),
		url(node) {
			const username = node?.closest('div[data-e2e=\'recommend-list-item-container\']')?.querySelector('a.avatar-anchor')?.getAttribute('href')?.replace('/', '');

			const vidId = node.getAttribute('id').replace('xgwrapper-0-', '');
			return `https://www.tiktok.com/${username}/video/${vidId}`;
		},
	},
]);

fixer.start();

function getVidId(url) {
	const tiktokUrl = url || window.location.href;
	// This regex should be safe as "Only letters, numbers, underscores, or periods are allowed" in TikTok usernames.
	const regex = /(?<=\/video\/)(.*?)(?=$|\D)/;
	const vidId = regex.exec(tiktokUrl)[0];
	return vidId;
}

function extractDateFromId(vidId) {
	// BigInt needed as we need to treat vidId as 64 bit decimal. This reduces browser support.
	const asBinary = BigInt(vidId).toString(2);
	const first31Chars = asBinary.slice(0, 31);
	const timestamp = Number.parseInt(first31Chars, 2);
	return new Date(timestamp * 1000);
}
