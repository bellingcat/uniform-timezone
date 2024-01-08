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
		selector: 'div.captures-range-info a[href^="/web/"], a.capture-link[href^="/web/"], a.snapshot-link[href^="/web/"]',
		attachTo: node => node,
		timestamp(node) {
			// Href = "/web/20230304105925/example.com"
			const timestamp = node.getAttribute('href').match(/\/web\/(\d+)\//);
			if (timestamp && timestamp[1]) {
				return parseWayBackMachineDateString(timestamp[1]);
			}

			return null;
		},
		url(node) {
			// `https://web.archive.org/web/20230304105925/example.com`
			return `https://web.archive.org${node.getAttribute('href')}`;
		},
		label: 'snapshot',
	},
]);

fixer.start();

const parseWayBackMachineDateString = dateString => {
	// DateString = "20230304105925" in UTC
	if (typeof dateString !== 'string' || !/^\d{14}$/.test(dateString)) {
		return null;
	}

	return moment.utc(dateString, 'YYYYMMDDHHmmss');
};

