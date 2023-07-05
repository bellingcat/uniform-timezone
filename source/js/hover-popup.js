
import optionsStorage from './options-storage.js';
import moment from 'moment-timezone';
const Icon = chrome.runtime.getURL("img/icon-128.png"); // require/import does not work

class HoverPopup {
	/**
	 * Expects an element to which attach the hover popup and a <time> element containing the time to display. It then injects the timezoned-data
	 * @param {Element} attachTo
	 * @param {DateTime} timeData Date/string instance with timezone information
	 * @param {int} hoverDelay defaults to 200
	 * @param {int} timeData defaults to 1500
	 */
	constructor(attachTo, timeData, { hoverDelay = 200, hoverAfter = 1000, postUrl = "" }) {
		console.log(`received timeData=${timeData} for ${attachTo}`)
		this.element = attachTo;
		this.time = timeData;
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
		this.popup.textContent = `This is the popup content ${this.time}`;

		const targetRect = this.element.getBoundingClientRect();
		const popupTop = targetRect.top + window.scrollY;
		const popupLeft = targetRect.right + window.scrollX;
		this.popup.style.top = `${popupTop}px`;
		this.popup.style.left = `${popupLeft}px`;
		this.setPopupHtml(this.time);
		document.body.appendChild(this.popup);
		this.setListeners();
		this.loadCustomTimezone();

	}

	hidePopup() {
		console.log('Popup hidden');
		// Hide or remove the popup element as desired
		this.popup?.remove()
		this.popup = undefined;
	}

	setPopupHtml() {
		const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		let moments = [
			{ timezone: "UTC", timeStr: this.moment.tz("UTC").format(), description: "Coordinated Universal Time or UTC is the primary time standard by which the world regulates clocks and time." },
			{ timezone: localTimezone, timeStr: this.moment.tz(localTimezone).format(), description: "Local timezone taken from your machine" },
			{ timezone: "UNIX timestamp", timeStr: this.moment.unix(), description: "Unix time is a date and time representation widely used in computing. It measures time by the number of seconds that have elapsed since 00:00:00 UTC on 1 January 1970, the Unix epoch." }
		]

		this.popup.innerHTML = `

		<h4><img class="icon" src='${Icon}'/> Uniform timezone formats</h4>

		<table class="timeItemContainer">
			<thead>
			<tr>
				<th>Timezone</th>
				<th>Time</th>
			</tr>
			</thead>
			<tbody>

			${moments.map(m => `<tr class="timeItem"><td title="${m.description}">${m.timezone}</td><td><a href="#!" class="copy-time-value" copy-value="${m.timeStr}" title="click to copy to clipboard">${m.timeStr}</a></td></tr>`).join("")}

			<tr id="custom-${this.randomId}">
				<td>
					<select id="select-${this.randomId}">
					${moment.tz.names().map(tz => `<option value="${tz}">${tz}</option>`).join("")}
					</select>
				</td>
				<td class="timeItem"><a href="#!" class="copy-time-value" copy-value="DYNAMIC"  title="click to copy to clipboard"></a></td>
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
