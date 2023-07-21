import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for *.instagram.com.
 * Timestamps handled by this script: ALL
 * How: by detecting <time> elements and appending a hover popup to them.
 * Each <time> element already contains the UTC value needed for the datetime extraction.
 * Possible improvements: better post Url detection. eg: it's hard to achieve in feed page due to fuzzy HTML/selectors.
*/
const fixer = new Fixer('Instagram', [
	{
		name: 'Content Timestamps',
		selector: 'time',
		attachTo: node => node,
		timestamp: node => node.getAttribute('datetime'),
		url: node => node.closest('a')?.href,
	},
]);

fixer.start();
