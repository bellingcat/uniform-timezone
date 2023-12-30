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
		timestamp: node => {
            // href = "/web/20230304105925/example.com"
            const timestamp = node.getAttribute('href').match(/\/web\/(\d+)\//);
            if(timestamp && timestamp[1]){
                return parseWayBackMachineDateString(timestamp[1]);
            } else {
                return null;
            }
        },
		url(node) {
			// `https://web.archive.org/web/20230304105925/example.com`
			return `https://web.archive.org${node.getAttribute('href')}`;
		},
        label: 'snapshot',
	},
]);

fixer.start();

const parseWayBackMachineDateString = (dateString) => {
    // dateString = "20230304105925"
    if (typeof dateString !== "string" || !/^\d{14}$/.test(dateString)) return null;

    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1;
    const day = parseInt(dateString.substring(6, 8), 10);
    const hours = parseInt(dateString.substring(8, 10), 10);
    const minutes = parseInt(dateString.substring(10, 12), 10);
    const seconds = parseInt(dateString.substring(12, 14), 10);
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds)).toISOString();
}

