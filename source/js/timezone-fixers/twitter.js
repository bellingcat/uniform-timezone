import HoverPopup from '../hover-popup.js';

console.log(`⏳ Twitter uniform timezone content script loaded for ${chrome.runtime.getManifest().name}`);
const timeInstances = new Set();
/**
 * This script enables uniform timestamps for twitter.com
 * HOW: by detecting <time> elements and appending a hover popup to them.
 * Each <time> element already contains the UTC value needed for the datetime extraction.
 */
async function attachTimeInfo() {
	Array.from(document.querySelectorAll("time")).map(t => {
		if (timeInstances.has(t)) return; // skip already processed

		new HoverPopup(t, t.getAttribute('datetime'), t.closest("a")?.href)
		timeInstances.add(t); // set as processed
	})
}

/**
 * repeats the logic every 0.5s since content is dynamically loaded with infinite scroll.
 */
setInterval(attachTimeInfo, 500);
