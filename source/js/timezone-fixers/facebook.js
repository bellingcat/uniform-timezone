import Fixer from '../fixer.js';
import moment from 'moment-timezone';

/**
 * This script enables uniform timestamps for *.facebook.com.
 * Timestamps handled by this script: ALL that can be hovered
 * How: by detecting facebook time tooltips that appear when you hover over timestamps.
 * Possible improvements: understand which JS elements call the tooltip and extract it without needing the user hover action.
*/
const fixer = new Fixer('Facebook', [
	{
		name: 'Content Timestamps',
		selector: 'span[role="tooltip"]',
		attachTo: node => node,
		timestamp: node => {
			console.log(node)
			console.log(node.textContent)
			return node.textContent
		},
		url: node => node.closest('a')?.href,
		displayOnly: true
	},
]);

fixer.start(250);
