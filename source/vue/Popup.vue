<template>
	<h5 class="center-s section-title">
		HELLO
		<button class="tooltipped waves-effect waves-light btn right" :class="archiveReady ? '' : 'disabled'"
			data-position="bottom" data-tooltip="Archive this URL" v-on:click="archive($event)">
			<i class="material-icons left">cloud</i> Archive
		</button>
	</h5>

</template>

<script>
import M from 'materialize-css';
// import TaskItem from './TaskItem.vue';

export default {
	data() {
		return {
			login: false,
			version: chrome.runtime.getManifest().version,
		};
	},
	methods: {
		/**
		 * Calls base endpoint '/' to check for errorMessage and groups
		 * @param {*} _
		 */
		callHome: function (_) {
			// (async () => {
			// 	const response = await this.callBackground({ action: "home" });
			// 	if (!response) return;
			// 	console.log(`HOME STATUS = ${response}`)
			// 	if (response?.breakingChanges?.minVersion > this.version) {
			// 		M.toast({ html: `${response.breakingChanges.message} (minimum version is ${response.breakingChanges.minVersion})`, classes: "light-blue darken-2" });
			// 	}
			// 	if (response.groups) { this.groups = response.groups }
			// })();
		},
		openTab: function (_, url) {
			chrome.tabs.create({ url });
		}
	},
	computed: {
	},
	mounted() {
		M.AutoInit();
	},
	created() { },
	components: {
		// TaskItem
	}
};
</script>
