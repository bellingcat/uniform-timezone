import {createApp} from 'vue';
import 'materialize-css/dist/css/materialize.min.css';
import 'material-design-icons/iconfont/material-icons.css';
import Popup from '../vue/Popup.vue';

const app = createApp(Popup);
app.mount('#app');

document.addEventListener('DOMContentLoaded', async () => {
	// eslint-disable-next-line no-undef
	M.Tooltip.init(document.querySelectorAll('.tooltipped'), {enterDelay: 500}); // Enable tooltips
});

