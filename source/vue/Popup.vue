<template>
	<h5 class="center-s section-title">
		Uniform Timezone Extension
	</h5>
	<p>
		<strong>{{ pageData.length }} datetime{{ pageData.length != 1 ? "s" : "" }} found</strong>
	</p>

	<button class="waves-effect waves-light btn" :class="pageData.length > 0 ? '' : 'disabled'" v-on:click="download()">
		<i class="material-icons left">file_download</i> Download as CSV
	</button>

	<table class="striped highlight">
		<thead>
			<tr>
				<th>Datetime (UTC)</th>
				<th>URL</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="entry in pageData">
				<td>{{ entry.time }}</td>
				<td><a href="{{ entry.url }}">{{ entry.url }}</a></td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import M from 'materialize-css';
// import TaskItem from './TaskItem.vue';

export default {
	data() {
		return {
			pageData: [],
			version: chrome.runtime.getManifest().version,
		};
	},
	methods: {
		loadTabData: function () {
			(async () => {
				const response = await this.callBackground({ action: "read-data" });
				if (!response) return;
				this.pageData = response;
				console.log(`HOME STATUS = ${response}`)
			})();
		},
		callBackground: async function (parameters) {
			try {
				const answer = await chrome.runtime.sendMessage(parameters);
				console.log(answer)
				if (answer.status == "error") {
					console.error(`error: ${answer.result}`)
					M.toast({ html: `Error: ${answer.result}`, classes: "red darken-1" });
					return null;
				} else {
					return answer.result;
				}
			} catch (e) {
				console.error(e);
				return null;
			}
		},
		download: function () {
			const header = Object.keys(this.pageData[0]);
			const csvContent =
				"data:text/csv;charset=utf-8," +
				header.join(",") +
				"\n" +
				this.pageData
					.map((obj) => Object.values(obj).join(","))
					.join("\n");

			const link = document.createElement('a');
			link.setAttribute('href', csvContent);
			link.setAttribute('download', 'utc-timestamps.csv');
			link.click();
		},
		openTab: function (_, url) {
			chrome.tabs.create({ url });
		}
	},
	computed: {
	},
	mounted() {
		M.AutoInit();
		this.loadTabData();
	},
	created() { },
	components: {
		// TaskItem
	}
};
</script>
