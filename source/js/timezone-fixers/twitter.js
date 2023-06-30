import HoverPopup from '../hover-popup.js';

console.log(`⏳ Twitter uniform timezone content script loaded for ${chrome.runtime.getManifest().name}`);
const timeInstances = new Set();
/**
 * This script enables uniform timestamps for twitter.com
 * HOW: by detecting <time> elements and appending a hover popup to them.
 * Each <time> element already contains the UTC value needed for the datetime extraction.
 */
async function attachTimeInfo() {
	// const iconElement = document.createElement('span');
	// iconElement.className = 'timezone-fixer-icon';
	// iconElement.innerText = "¿"
	Array.from(document.querySelectorAll("time")).map(t => {
		if (timeInstances.has(t)) return; // skip already processed

		// let newIcon = iconElement.cloneNode(true)
		new HoverPopup(t, t.getAttribute('datetime'))
		// newIcon.onclick = (e) => {
		// 	e.preventDefault();
		// 	console.log("clicked time")
		// 	// appendPopup(newIcon, t)
		// 	// await chrome.runtime.sendMessage({action: "openPopup", props: {time: t}});

		// }
		//iconElement.onclick
		// newIcon.addEventListener('mouseenter', () => {
		// 	console.log("HOVER")
		// });
		// t.parentNode.parentNode.appendChild(newIcon, t.nextSibling)
		// t.appendChild(iconElement.cloneNode(true))

		timeInstances.add(t); // set as processed
	})
	console.log("done")
}

/**
 * repeats the logic every 2.5s since content is dynamically loaded with infinite scroll.
 */
setInterval(attachTimeInfo, 2500);
