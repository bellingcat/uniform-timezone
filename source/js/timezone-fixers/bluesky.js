import moment from 'moment-timezone';
import Fixer from '../fixer.js';
import {getLang} from '../utils.js';
/**
 * This script enables uniform timestamps for bsky.app
 * Timestamps handled by this script: ALL
 * How: by detecting a/div elements with data-tooltip and appending a hover popup to them.
 * NOTE: only working for English translations of the platform.
*/
const fixer = new Fixer('Bluesky', [
	{
		name: 'Tweet Timestamps',
		selector: 'a[data-tooltip][aria-label],div[data-tooltip]',
		filterSelected: note => note.dataset.tooltip?.includes('at '),
		attachTo: node => node,
		timestamp: node => moment(node.dataset.tooltip, 'MMM D, YYYY [at] h:mm A', getLang()).tz(moment.tz.guess()),
		url: node => node?.href || window.location.href,
	},
]);

fixer.start();
