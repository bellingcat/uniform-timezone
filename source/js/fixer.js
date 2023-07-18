import HoverPopup from './hover-popup.js';

/**
 * @callback URLResolver
 * @param {HTMLElement} node
 * @returns {string}
*/

/**
 * @callback TimestampResolver
 * @param {HTMLElement} node
 * @returns {string}
*/

/**
 * @callback AttachToResolver
 * @param {HTMLElement} node
 * @returns {HTMLElement}
*/

/**
 * @typedef Target
 * @type {object}
 * @property {string} name - Name of this target.
 * @property {string} selector - DOM selector that resolves timestamp nodes.
 * @property {URLResolver} url - Function that resolves the canonical URL for a timestamp.
 * @property {TimestampResolver} timestamp - Function that resolves the ISO timestamp for a node.
 * @property {AttachToResolver} attachTo - Function that resolves where the popup should attach to.
 */

/**
 * Class representing a fixer script.
 */
class Fixer {
	/**
	 * @param {string} platform
	 * @param {Target[]} targets
	 */
	constructor(platform, targets) {
		this.processed = new Set();
		this.targets = targets;

		console.log(`⏳ [${chrome.runtime.getManifest().name} ${chrome.runtime.getManifest().version}] script loaded for ${platform}`);
	}

	start(interval = 500) {
		setInterval(this.process.bind(this), interval);
	}

	process() {
		for (const target of this.targets) {
			for (const node of this.getNodes(target)) {
				try {
					// eslint-disable-next-line no-new
					new HoverPopup(target.attachTo(node), target.timestamp(node), target.url(node));
				} catch (error) {
					console.error('failed to process node:', error, node);
				} finally {
					this.processed.add(node);
				}
			}
		}
	}

	getNodes(target) {
		const nodes = Array.from(document.querySelectorAll(target.selector));
		return nodes.filter(node => !this.processed.has(node));
	}
}

export default Fixer;
