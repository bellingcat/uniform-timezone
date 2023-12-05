import Fixer from '../fixer.js';
import moment from 'moment-timezone';
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
		filterSelected: note => note.getAttribute('data-tooltip')?.includes('at '),
		attachTo: node => node,
		timestamp: node => moment(node.getAttribute('data-tooltip'), "MMM D, YYYY [at] h:mm A", getLang()).tz(moment.tz.guess()),
		url: node => node?.href || window.location.href,
	},
]);
function getLang() {
	if (navigator.languages != undefined)
	  return navigator.languages[0];
	return navigator.language;
  }
fixer.start();
