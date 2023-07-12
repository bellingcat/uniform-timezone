/**
 * storing time/url info per tab, so it can be displayed/downloaded
 */
const pageData = {};

// clear data structure on tab updated/removed/replaced
chrome.tabs.onUpdated.addListener((tabId) => pageData[tabId] = []);
chrome.tabs.onRemoved.addListener((tabId) => pageData[tabId] = []);
chrome.tabs.onReplaced.addListener((_addedTabId, removedTabId) => pageData[removedTabId] = []);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log(`Received message ='${JSON.stringify(message)}' sender=${JSON.stringify(sender)} sendResponse=${sendResponse}`)

	if (message.action == "store-data") { //stores data sent by content-scripts
		if (!pageData[sender.tab.id]) { pageData[sender.tab.id] = []; }
		pageData[sender.tab.id].push(message.data);
	} else if (message.action == "read-data") {
		chrome.tabs.query({
			active: true,
			lastFocusedWindow: true,
		}, async tabs => {
			console.log(tabs)
			console.log(pageData[tabs[0].id])
			sendResponse({ status: "success", result: pageData[tabs[0].id] })
		});
	}
	return true; // Needed for sendResponse to be async
});
