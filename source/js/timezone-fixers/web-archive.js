import moment from 'moment-timezone';
import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for web.archive.org.
 * Timestamps handled by this script:
 *   - start and end date of snapshots in WayBack Machine's calendar view
 *     - saved n times between <start date> and <end date>
 *     - div.captures-range-info a[href^="/web/"]
 *   - time of capture shown at the top of the calendar view
 *     - a.capture-link[href^="/web/"]
 *   - time of crawl in WayBack Machine's calendar view
 *     - a.snapshot-link[href^="/web/"]
*/
const fixer = new Fixer('WayBackMachine', [
	{
		name: 'Time of Crawl',
		selector: 'div.captures-range-info a[href^="/web/"], a.snapshot-link[href^="/web/"]',
		attachTo: node => node,
		timestamp: getTimestampFromHref,
		url: getResourceUrlFromHref,
		label: 'snapshot',
	},
	{
		name: 'Last Hovered Time of Crawl',
		selector: 'a.capture-link[href^="/web/"]',
		attachTo: node => node,
		timestamp: getTimestampFromHref,
		url: getResourceUrlFromHref,
		label: 'snapshot',
		observe(node, popup) {
			const observer = new MutationObserver(mutationsList => {
				// If href attribute changed, update timestamp and resourceUrl in the popup
				for (const mutation of mutationsList) {
					if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
						popup.moment = getTimestampFromHref(node);
						popup.resourceUrl = `https://web.archive.org${node.getAttribute('href')}`;
					}
				}
			});
			observer.observe(node, {attributes: true});
		},
	},
]);

function getTimestampFromHref(node) {
	// Href = "/web/20230304105925/example.com"
	const timestamp = node.getAttribute('href').match(/\/web\/(\d+)\//);
	if (timestamp && timestamp[1] && /^\d{14}$/.test(timestamp[1])) {
		return moment.utc(timestamp[1], 'YYYYMMDDHHmmss');
	}

	return null;
}

function getResourceUrlFromHref(node) {
	// Href = "/web/20230304105925/example.com"
	// ResourceUrl = 'https://web.archive.org/web/20230304105925/example.com'
	return `https://web.archive.org${node.getAttribute('href')}`;
}

fixer.start();
