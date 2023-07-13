import HoverPopup from '../hover-popup.js';

console.log(`⏳ Tiktok uniform timezone content script loaded for ${chrome.runtime.getManifest().name}`);
const attachedElements = new Set();
/**
 * This script enables uniform timestamps for tiktok.com
 * HOW: by detecting a
 *    <span data-e2e="browser-nickname"> element (appears in the post page for example https://www.tiktok.com/@username/video/videoId)
 *    <div id="xgwrapper-0-videoId"> elements (appear in scroll mode, example: https://www.tiktok.com/foryou)
 *    <div data-e2e="user-post-item-desc"> elements (appear on the user page thumbnails)
 *    <div data-e2e="explore-item"> elements (appear on the /explore page thumbnails)
 * 	  HARD TODO: is it possible to do it for the "you may like" section on the right side of a video page? there is no id in the html but perhaps the click event listener could somehow be intercepted/mocked.
 */
async function attachTimeInfo() {
	// for a maximized video page -> hover over username
	Array.from(document.querySelectorAll('span[data-e2e="browser-nickname"]')).map(span => {
		if (attachedElements.has(span)) return; // skip already processed

		const timestamp = extractUnixTimestamp(getVidId())
		console.log(`vid=${getVidId()}: timestamp=${timestamp}`)
		new HoverPopup(span, new Date(timestamp * 1000))
		attachedElements.add(span); // set as processed
	})

	// for user page video thumbnails AND for the /explore thumbnails page
	Array.from(document.querySelectorAll('div[data-e2e="user-post-item-desc"],div[data-e2e="explore-item"]')).map(div => {
		if (attachedElements.has(div)) return; // skip already processed
		const vidUrl = div.querySelector("a")?.href;
		if (!vidUrl) return;
		const timestamp = extractUnixTimestamp(getVidId(vidUrl));
		console.log(`vid=${getVidId(vidUrl)}: timestamp=${timestamp}`)
		const attachTo = div.parentNode.querySelector('div[data-e2e="explore-card-desc"]') || div.parentNode.querySelector('div[data-e2e="user-post-item-desc"]')
		new HoverPopup(attachTo, new Date(timestamp * 1000), vidUrl)
		attachedElements.add(div); // set as processed
	})

	// for the feed pages
	Array.from(document.querySelectorAll('div[id^="xgwrapper-0-"]')).map(div => {
		if (attachedElements.has(div)) return; // skip already processed
		const username = div?.closest("div[data-e2e='recommend-list-item-container']")?.querySelector("a.avatar-anchor")?.getAttribute("href")?.replace("/", "");

		const vidId = div.getAttribute("id").replace("xgwrapper-0-", "");
		const timestamp = extractUnixTimestamp(vidId)
		console.log(`timestamp=${timestamp}`)
		new HoverPopup(div, new Date(timestamp * 1000), `https://www.tiktok.com/${username}/video/${vidId}`)
		attachedElements.add(div); // set as processed
	})
}

function getVidId(url) {
	const tiktokUrl = url || window.location.href;
	// This regex should be safe as "Only letters, numbers, underscores, or periods are allowed" in TikTok usernames.
	const regex = /(?<=\/video\/)(.*?)(?=$|[^0-9])/;
	const vidId = regex.exec(tiktokUrl)[0];
	return vidId;
}

function extractUnixTimestamp(vidId) {
	// BigInt needed as we need to treat vidId as 64 bit decimal. This reduces browser support.
	const asBinary = BigInt(vidId).toString(2);
	const first31Chars = asBinary.slice(0, 31);
	const timestamp = parseInt(first31Chars, 2);
	return timestamp;
}

/**
 * repeats the logic every 0.5s since content is dynamically loaded with infinite scroll.
 */
setInterval(attachTimeInfo, 500);
