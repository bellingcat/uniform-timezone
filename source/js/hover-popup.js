
import optionsStorage from './options-storage.js';
import moment from 'moment-timezone';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
// import { createPopper } from '@popperjs/core';

const Icon = chrome.runtime.getURL("img/icon-128.png"); // require/import does not work

class HoverPopup {
	/**
	 * Expects an element to which attach the hover popup and a <time> element containing the time to display. It then injects the timezoned-data
	 * @param {Element} attachTo
	 * @param {DateTime} timeData Date/string instance with timezone information
	 * @param {int} hoverDelay defaults to 200
	 * @param {int} hoverAfter defaults to 1000
	 * @param {string} postUrl defaults to empty string - if included adds a link to the popup
	 */
	constructor(attachTo, timeData, postUrl = "", hoverDelay = 200, hoverAfter = 1000) {
		console.log(`received timeData=${timeData} for ${attachTo}`)
		this.element = attachTo;
		this.moment = moment(timeData)
		this.version = chrome.runtime.getManifest().version;

		// optional parameters
		this.hoverDelay = hoverDelay;
		this.hoverAfter = hoverAfter;
		this.postUrl = postUrl;


		this.hoverTimeout = null;
		this.isHovered = false;
		this.randomId = Math.random().toString(36).substring(2, 12);

		this.element.addEventListener('mouseover', this.handleHoverStart.bind(this));
		this.element.addEventListener('mouseout', this.handleHoverEnd.bind(this));

		// this.popup = document.createElement('div');
		// this.popup.classList.add('timezone-fixer-popup');
		// this.popup.innerHTML = this.getPopupHtml();
		// document.body.appendChild(this.popup);
		// const popperInstance = createPopper(this.element, this.popup, {
		// 	placement: 'right-start',

		// })

		// function show() {
		// 	console.log("SHOW")
		// 	// Make the tooltip visible
		// 	this.popup.setAttribute('data-show', '');
		// 	console.log(this.popup)
		// 	// Enable the event listeners
		// 	popperInstance.setOptions((options) => ({
		// 		...options,
		// 		modifiers: [
		// 			...options.modifiers,
		// 			{ name: 'eventListeners', enabled: true },
		// 		],
		// 	}));

		// 	// Update its position
		// 	popperInstance.update();
		// }

		// function hide() {
		// 	console.log("HIDE")
		// 	// Hide the tooltip
		// 	this.popup.removeAttribute('data-show');

		// 	// Disable the event listeners
		// 	popperInstance.setOptions((options) => ({
		// 		...options,
		// 		modifiers: [
		// 			...options.modifiers,
		// 			{ name: 'eventListeners', enabled: false },
		// 		],
		// 	}));
		// }

		// const showEvents = ['mouseenter', 'focus'];
		// const hideEvents = ['mouseleave', 'blur'];

		// showEvents.forEach((event) => {
		// 	this.element.addEventListener(event, show.bind(this));
		// });

		// hideEvents.forEach((event) => {
		// 	this.element.addEventListener(event, hide.bind(this));
		// });



		// this.tippy = tippy(this.element, {
		// 	allowHTML: true,
		// 	content: this.getPopupHtml(),
		// 	placement: 'right-start',
		// 	// arrow: true,
		// 	duration: [this.hoverDelay, this.hoverAfter],
		// 	interactive: true,
		// 	appendTo: () => document.body
		// 	// hideOnClick: false,
		// 	// trigger: 'click'
		// });
		// console.log(this.tippy)
		// this.tippy.show()
		// this.tippy.hide();
		// this.setListeners();
		// // this.loadCustomTimezone();
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
		if (this.popup !== undefined) return;
		console.log('Popup shown');


		this.popup = document.createElement('div');
		this.popup.addEventListener('mouseover', this.handleHoverStart.bind(this));
		this.popup.addEventListener('mouseout', this.handleHoverEnd.bind(this));

		this.popup.classList.add('timezone-fixer-popup');

		this.setPopupHtml();
		this.popup.display = 'none';
		document.body.appendChild(this.popup);
		// const targetRect = this.element.getBoundingClientRect();
		// const popupTop = targetRect.top + window.scrollY;
		// const popupLeft = targetRect.right + window.scrollX;
		this.placePopup(this.element, this.popup);
		// this.popup.style.top = `${top}px`;
		// this.popup.style.left = `${left}px`;
		this.setListeners();
		this.loadCustomTimezone();
		this.popup.display = 'block';

	}

	hidePopup() {
		console.log('Popup hidden');
		// Hide or remove the popup element as desired
		this.popup?.remove()
		this.popup = undefined;
	}

	placePopup(hoveredElement, popupElement) {
		const targetRect = this.element.getBoundingClientRect();
		const popupTop = targetRect.top + window.scrollY;
		const popupLeft = targetRect.right + window.scrollX;

		// Get the dimensions of the popup element
		let popupWidth = popupElement.offsetWidth;

		// Get the dimensions of the viewport
		let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		// Calculate the right position if there is enough space
		let rightPosition = targetRect.left + targetRect.width;
		let hasSpaceOnRight = rightPosition + popupWidth <= viewportWidth;
		console.log(targetRect)
		this.popup.style.top = `${popupTop}px`;
		this.popup.style.left = hasSpaceOnRight ? `${popupLeft}px` : `${Math.max(targetRect.left + window.scrollX - popupWidth, 0)}px`;
		// return { top: popupTop, left: popupLeft };


		// // Get the dimensions of the hovered element
		// let elementRect = hoveredElement.getBoundingClientRect();

		// // Get the dimensions of the popup element
		// // let popupWidth = popupElement.offsetWidth;
		// let popupHeight = popupElement.offsetHeight;

		// // Get the dimensions of the viewport
		// // let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		// // let viewportHeight = window.innerHeight || document.documentElement.clientHeight;

		// // Calculate the right position if there is enough space
		// // let rightPosition = elementRect.left + elementRect.width;
		// // let hasSpaceOnRight = rightPosition + popupWidth <= viewportWidth;

		// // Calculate the top and left position for the popup
		// let topPosition = elementRect.top + (elementRect.height - popupHeight) / 2;
		// let leftPosition = hasSpaceOnRight ? rightPosition : elementRect.left - popupWidth;

		// // Return an object with the calculated positions
		// return { top: topPosition, left: leftPosition };
	}

	getPopupHtml() {
		const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		let moments = [
			{ timezone: "UTC", timeStr: this.moment.tz("UTC").format(), description: "Coordinated Universal Time or UTC is the primary time standard by which the world regulates clocks and time." },
			{ timezone: localTimezone, timeStr: this.moment.tz(localTimezone).format(), description: "Local timezone taken from your machine" },
			{ timezone: "UNIX timestamp", timeStr: this.moment.unix(), description: "Unix time is a date and time representation widely used in computing. It measures time by the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the Unix epoch." },
			{ timezone: "Relative", timeStr: this.moment.fromNow(), description: "How long ago." },
		]

		return `
		<div class="timezone-fixer-popup">
		<h4><img class="icon" src='${Icon}'/> Uniform timezone formats</h4>

		<table class="time-item-container">
			<thead>
			<tr>
				<th>Timezone</th>
				<th>Time</th>
			</tr>
			</thead>
			<tbody>

			${moments.map(m => `<tr class="time-item"><td title="${m.description}">${m.timezone}</td><td><a href="#!" class="copy-time-value" copy-value="${m.timeStr}" title="click to copy to clipboard">${m.timeStr}</a></td></tr>`).join("")}

			<tr id="custom-${this.randomId}">
				<td>
					<select id="select-${this.randomId}">
					${moment.tz.names().map(tz => `<option value="${tz}">${tz}</option>`).join("")}
					</select>
				</td>
				<td class="time-item"><a href="#!" class="copy-time-value" copy-value="DYNAMIC"  title="click to copy to clipboard"></a></td>
			</tr>
			</tbody>
		</table>

		${this.postUrl ? `<small>post: <a href="${this.postUrl}" title="link to post">${this.postUrl}</a><small/>` : ''}

		<hr/>

		<p class="right-align">Open datetime <a href="https://www.timeanddate.com/worldclock/converter.html?iso=${this.moment.format().replaceAll(/[-:.Z]/g, "")}&p1=1440" target="_blank">externally</a></p>
		<small class="right-align">Uniform Timezone Extension <a href="https://github.com/bellingcat/uniform-timezone" target="_blank">v${this.version}</a> (please report any issues)</small>
		</div>
		`
	}

	setPopupHtml() {
		const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		let moments = [
			{ timezone: "UTC", timeStr: this.moment.tz("UTC").format(), description: "Coordinated Universal Time or UTC is the primary time standard by which the world regulates clocks and time." },
			{ timezone: localTimezone, timeStr: this.moment.tz(localTimezone).format(), description: "Local timezone taken from your machine" },
			{ timezone: "UNIX timestamp", timeStr: this.moment.unix(), description: "Unix time is a date and time representation widely used in computing. It measures time by the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the Unix epoch." },
			{ timezone: "Relative", timeStr: this.moment.fromNow(), description: "How long ago." },
		]

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

			${moments.map(m => `<tr class="time-item"><td title="${m.description}">${m.timezone}</td><td><a href="#!" class="copy-time-value" copy-value="${m.timeStr}" title="click to copy to clipboard">${m.timeStr}</a></td></tr>`).join("")}

			<tr id="custom-${this.randomId}">
				<td>
					<select id="select-${this.randomId}">
					${moment.tz.names().map(tz => `<option value="${tz}">${tz}</option>`).join("")}
					</select>
				</td>
				<td class="time-item"><a href="#!" class="copy-time-value" copy-value="DYNAMIC"  title="click to copy to clipboard"></a></td>
			</tr>
			</tbody>
		</table>

		${this.postUrl ? `<small>post: <a href="${this.postUrl}" title="link to post">${this.postUrl}</a><small/>` : ''}

		<hr/>

		<p class="right-align">Open datetime <a href="https://www.timeanddate.com/worldclock/converter.html?iso=${this.moment.format().replaceAll(/[-:.Z]/g, "")}&p1=1440" target="_blank">externally</a></p>
		<small class="right-align">Uniform Timezone Extension <a href="https://github.com/bellingcat/uniform-timezone" target="_blank">v${this.version}</a> (please report any issues)</small>
		`
	}
	setListeners() {
		const customTZ = document.querySelector(`#custom-${this.randomId}`);
		// customTZ.style.display = "none";

		// listens for changes on the timezone select element
		const selectElement = document.querySelector(`#select-${this.randomId}`);
		selectElement.addEventListener("change", async () => {
			let selectedTz = selectElement.value;
			customTZ.style.display = "table-row;";
			const customTz = this.moment.tz(selectedTz).format()
			customTZ.querySelector("a").innerText = customTz;
			customTZ.querySelector("a").setAttribute("copy-value", customTz);
			await optionsStorage.set({ customTimezone: selectedTz })
		});

		// enables the copy-to-clipboard method
		Array.from(document.querySelectorAll(".copy-time-value")).forEach(copy => {
			try { copy.removeEventListener('click'); } catch (_) { }
			copy.addEventListener('click', (e) => {
				navigator.clipboard.writeText(e.target.getAttribute("copy-value"));
				console.log('copied to clipboard:', e.target.getAttribute("copy-value"));
			})
		})
	}

	async loadCustomTimezone() {
		const options = await optionsStorage.getAll();
		if (options.customTimezone !== undefined) {
			const selectElement = document.querySelector(`#select-${this.randomId}`);
			console.log(`changing element ${selectElement} to ${options.customTimezone}`)
			selectElement.value = options.customTimezone;
			selectElement.dispatchEvent(new Event('change'));
		}
	}
}

export default HoverPopup;
