import HoverPopup from '../hover-popup.js';

console.log(`⏳ Twitter uniform timezone content script loaded for ${chrome.runtime.getManifest().name}`);
const timeInstances = new Set();
/**
 * This script enables uniform timestamps for twitter.com
 * HOW: by detecting <time> elements and appending a hover popup to them.
 * Each <time> element already contains the UTC value needed for the datetime extraction.
 */
async function attachTimeInfo() {
	for (const t of Array.from(document.querySelectorAll('time'))) {
		if (timeInstances.has(t)) {
			continue;
		} // Skip already processed

		// eslint-disable-next-line no-new
		new HoverPopup(t, t.getAttribute('datetime'), t.closest('a')?.href);
		timeInstances.add(t); // Set as processed
	}
}

/**
 * Repeats the logic every 0.5s since content is dynamically loaded with infinite scroll.
 */
setInterval(attachTimeInfo, 500);
