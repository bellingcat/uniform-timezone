
import { createApp } from 'vue';
// import HoverTimePopup from '../vue/HoverTimePopup.vue'
// import 'materialize-css/dist/css/materialize.min.css';
// import 'material-design-icons/iconfont/material-icons.css';
// import { createApp, defineComponent } from 'vue';
import Icon from '../img/icon-128.png';
var moment = require('moment-timezone');


class HoverPopup {
	/**
	 * Expects an element to which attach the hover popup and a <time> element containing the time to display
	 * @param {Element} attachTo
	 * @param {DateTime} timeData Date/string instance with timezone information
	 * @param {int} hoverDelay defaults to 200
	 * @param {int} timeData defaults to 1500
	 */
	constructor(attachTo, timeData, hoverDelay, hoverAfter) {
		console.log(`timeData=${timeData}`)
		this.element = attachTo;
		this.time = timeData;
		this.moment = moment(timeData)
		this.version = chrome.runtime.getManifest().version;

		this.hoverDelay = hoverDelay || 200;
		this.hoverAfter = hoverAfter || 150000;
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


		// const MyComponent = {
		// 	template: `
		// 	  <div>
		// 		<h1>Hello, {{ name }}!</h1>
		// 	  </div>
		// 	`,
		// 	data() {
		// 		return {
		// 			name: 'John',
		// 		};
		// 	},
		// 	mounted(){
		// 		console.log(`MOUNTED ${this.time}`)
		// 	}
		// };
		// const app = createApp({
		// 	components: {
		// 		MyComponent,
		// 	},
		// });

		// app.mount(`#vue-container-${this.randomId}`);

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
			{ timezone: "UTC", timeStr: this.moment.tz("UTC").format() },
			{ timezone: localTimezone, timeStr: this.moment.tz(localTimezone).format() },
			{ timezone: "UNIX timestamp", timeStr: this.moment.unix() }
		]

		this.popup.innerHTML = `

		<h4><img class="icon" src='${Icon}'/> Uniform timezone formats</h4>

		<label for="select-${this.randomId}">Custom:</label>
		<select id="select-${this.randomId}">
			${moment.tz.names().map(tz => `<option value="${tz}">${tz}</option>`).join("")}
		</select>

		<div class="timeItemContainer" title="click to copy to clipboard">
			${moments.map(m => `<div class="timeItem"><b>${m.timezone}</b> - <a href="#!" class="copy-time-value" copy-value="${m.timeStr}">${m.timeStr}</a></div>`).join("")}
			<div class="timeItem" id="custom-${this.randomId}"><b></b> - <a href="#!" class="copy-time-value" copy-value="DYNAMIC">TODO</a></div>
		</div>

		<hr/>
		<p class="right-align">Open <a href="https://www.timeanddate.com/worldclock/converter.html?iso=${this.moment.format().replaceAll(/[-:.Z]/g, "")}&p1=1440" target="_blank">externally</a></p>
		<small class="right-align">Uniform Timezone Extension v${this.version}</small>
		`
	}
	setListeners() {
		const customTZ = document.querySelector(`#custom-${this.randomId}`);
		customTZ.style.display = "none";

		const selectElement = document.querySelector(`#select-${this.randomId}`);
		selectElement.addEventListener("change", () => {
			let selectedTz = selectElement.value;
			customTZ.style.display = "block";
			const customTz = this.moment.tz(selectedTz).format()
			customTZ.querySelector("b").innerText = selectedTz;
			customTZ.querySelector("a").innerText = customTz;
			customTZ.querySelector("a").setAttribute("copy-value", customTz);
		});


		Array.from(document.querySelectorAll(".copy-time-value")).forEach(copy => {
			try { copy.removeEventListener('click'); } catch (_) { }
			copy.addEventListener('click', (e) => {
				navigator.clipboard.writeText(e.target.getAttribute("copy-value"));
				console.log('copied to clipboard:', e.target.getAttribute("copy-value"));
			})
		})
	}
}

export default HoverPopup;
