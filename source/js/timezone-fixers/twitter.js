import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for twitter.com.
 * Timestamps handled by this script: ALL
 * How: by detecting <time> elements and appending a hover popup to them.
 * Each <time> element already contains the UTC value needed for the datetime extraction.
*/
const fixer = new Fixer('Twitter', [
	{
		name: 'Tweet Timestamps',
		selector: 'time',
		attachTo: node => node,
		timestamp: node => node.getAttribute('datetime'),
		url: node => node.closest('a')?.href,
	},
]);

fixer.start();
