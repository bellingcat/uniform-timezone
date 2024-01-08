/* eslint-disable max-params */
import moment from 'moment-timezone';
import optionsStorage from './options-storage.js';

const Icon = chrome.runtime.getURL('img/icon-128.png'); // Require/import does not work

class HoverPopup {
	/**
	 * Expects an element to which attach the hover popup and a <time> element containing the time to display. It then injects the timezoned-data
	 * @param {Element} attachTo
	 * @param {DateTime} timeData Date/string instance with timezone information
	 * @param {int} hoverDelay defaults to 200
	 * @param {int} hoverAfter defaults to 500
	 * @param {string} resourceLabel defaults to empty string - if included used as a label for the resourceUrl
	 * @param {string} resourceUrl defaults to empty string - if included adds a link to the popup
	 */
	constructor(attachTo, timeData, resourceLabel = '', resourceUrl = '', hoverDelay = 200, hoverAfter = 500) {
		console.log(`received timeData=${timeData} for ${attachTo}`);
		this.moment = moment(timeData);
		chrome.runtime.sendMessage({action: 'store-data', data: {url: resourceUrl, time: this.moment.tz('UTC').format()}});
		this.element = attachTo;
		this.version = chrome.runtime.getManifest().version;

		// Optional parameters
		this.hoverDelay = hoverDelay;
		this.hoverAfter = hoverAfter;
		this.resourceUrl = resourceUrl;
		this.resourceLabel = resourceLabel;

		this.hoverTimeout = null;
		this.isHovered = false;
		this.randomId = Math.random().toString(36).slice(2, 12);

		this.element.addEventListener('mouseover', this.handleHoverStart.bind(this));
		this.element.addEventListener('mouseout', this.handleHoverEnd.bind(this));
	}

	handleHoverStart() {
		clearTimeout(this.hoverTimeout);
		this.isHovered = true;

		this.hoverTimeout = setTimeout(() => {
			this.showPopup();
		}, this.hoverDelay);
	}

	handleHoverEnd() {
		clearTimeout(this.hoverTimeout);

		if (this.isHovered) {
			this.hoverTimeout = setTimeout(() => {
				this.hidePopup();
				this.isHovered = false;
			}, this.hoverAfter);
		}
	}

	showPopup() {
		if (this.popup !== undefined) {
			return;
		}

		this.popup = document.createElement('div');
		this.popup.addEventListener('mouseover', this.handleHoverStart.bind(this));
		this.popup.addEventListener('mouseout', this.handleHoverEnd.bind(this));

		this.popup.classList.add('timezone-fixer-popup');

		this.setPopupHtml();
		this.popup.display = 'none';
		document.body.append(this.popup);
		this.placePopup(this.element, this.popup);
		this.setListeners();
		this.loadCustomTimezone();
		this.popup.display = 'block';
	}

	hidePopup() {
		// Hide or remove the popup element as desired
		this.popup?.remove();
		this.popup = undefined;
	}

	placePopup() {
		const targetRect = this.element.getBoundingClientRect();
		const popupTop = targetRect.top + window.scrollY;
		const popupLeft = targetRect.right + window.scrollX;

		// Get the dimensions of the popup element
		const popupWidth = this.popup.offsetWidth;
		// Get the dimensions of the viewport
		const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		// Calculate the right position if there is enough space
		const rightPosition = targetRect.left + targetRect.width;
		const hasSpaceOnRight = rightPosition + popupWidth <= viewportWidth;
		// Set top/left
		this.popup.style.top = `${popupTop}px`;
		this.popup.style.left = hasSpaceOnRight ? `${popupLeft}px` : `${Math.max(targetRect.left + window.scrollX - popupWidth, 0)}px`;
	}

	setPopupHtml() {
		const localTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

		const moments = [
			{timezone: 'UTC', timeStr: this.moment.tz('UTC').format(), description: 'Coordinated Universal Time or UTC is the primary time standard by which the world regulates clocks and time.'},
			{timezone: localTimezone, timeStr: this.moment.tz(localTimezone).format(), description: 'Local timezone taken from your machine'},
			{timezone: 'UNIX timestamp', timeStr: this.moment.unix(), description: 'Unix time is a date and time representation widely used in computing. It measures time by the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the Unix epoch.'},
			{timezone: 'Relative', timeStr: this.moment.fromNow(), description: 'How long ago.'},
		];

		this.popup.innerHTML = `

		<h4><img class="icon" src='${Icon}'/> Uniform timezone formats</h4>

		<table class="time-item-container">
			<thead>
			<tr>
				<th>Timezone</th>
				<th>Time</th>
			</tr>
			</thead>
			<tbody>

			${moments.map(m => `<tr class="time-item"><td title="${m.description}">${m.timezone}</td><td><a class="copy-time-value" copy-value="${m.timeStr}" title="click to copy to clipboard">${m.timeStr}</a></td></tr>`).join('')}

			<tr id="custom-${this.randomId}">
				<td>
					<select id="select-${this.randomId}">
					${moment.tz.names().map(tz => `<option value="${tz}">${tz}</option>`).join('')}
					</select>
				</td>
				<td class="time-item"><a class="copy-time-value" copy-value="DYNAMIC" title="click to copy to clipboard"></a></td>
			</tr>
			</tbody>
		</table>

		${this.resourceUrl ? `<small>${this.resourceLabel}: <a href="${this.resourceUrl}" title="link to resource">${this.resourceUrl}</a> - <a class="copy-time-value" copy-value="${this.resourceUrl}" title="click to copy to clipboard">copy</a><small/>` : ''}

		<hr/>

		<p class="right-align">Open datetime <a href="https://www.timeanddate.com/worldclock/converter.html?iso=${this.moment.format().replaceAll(/[-:.Z]/g, '')}&p1=1440" target="_blank">externally</a></p>
		<small class="right-align">Uniform Timezone Extension <a href="https://github.com/bellingcat/uniform-timezone" target="_blank">v${this.version}</a> (please report any <a href="https://github.com/bellingcat/uniform-timezone/issues">issues</a>)</small>
		`;
	}

	setListeners() {
		const customTZ = document.querySelector(`#custom-${this.randomId}`);
		// CustomTZ.style.display = "none";

		// listens for changes on the timezone select element
		const selectElement = document.querySelector(`#select-${this.randomId}`);
		selectElement.addEventListener('change', async () => {
			const selectedTz = selectElement.value;
			customTZ.style.display = 'table-row;';
			const customTz = this.moment.tz(selectedTz).format();
			customTZ.querySelector('a').textContent = customTz;
			customTZ.querySelector('a').setAttribute('copy-value', customTz);
			await optionsStorage.set({customTimezone: selectedTz});
		});

		// Enables the copy-to-clipboard method
		for (const copy of Array.from(document.querySelectorAll('.copy-time-value'))) {
			try {
				copy.removeEventListener('click');
			} catch {}

			copy.addEventListener('click', evt => {
				navigator.clipboard.writeText(evt.target.getAttribute('copy-value'));
				console.log('copied to clipboard:', evt.target.getAttribute('copy-value'));
			});
		}
	}

	async loadCustomTimezone() {
		const options = await optionsStorage.getAll();
		if (options.customTimezone !== undefined) {
			const selectElement = document.querySelector(`#select-${this.randomId}`);
			selectElement.value = options.customTimezone;
			selectElement.dispatchEvent(new Event('change'));
		}
	}
}

export default HoverPopup;
