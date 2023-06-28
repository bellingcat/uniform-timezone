// import optionsStorage from './options-storage.js';
import HoverPopup from '../hover-popup.js';
// import { createApp } from 'vue';
// import HoverTimePopup from '../../vue/HoverTimePopup.vue'
// import 'materialize-css/dist/css/materialize.min.css';
// import 'material-design-icons/iconfont/material-icons.css';
// import Icon from '../../img/icon-128.png';

console.log('⏳ Content script loaded for', chrome.runtime.getManifest().name);


const timeInstances = new Set();
/**
 * Current twitter setup uses <a><time></a> and this code appends a <span class='timezone-fixer-icon'> after </a>
 */
async function attachTimeInfo() {
	const iconElement = document.createElement('span');
	// iconElement.setAttribute('src', Icon)
	iconElement.className = 'timezone-fixer-icon';
	iconElement.innerText = "¿"
	Array.from(document.querySelectorAll("time")).map(t => {
		if (timeInstances.has(t)) return; // skip already processed

		// const app = createApp(HoverTimePopup, {props: {time: t}});
		// const vueEl = document.createElement('span');
		// t.appendChild(vueEl)
		// app.mount(vueEl);

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
