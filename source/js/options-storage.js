import OptionsSync from 'webext-options-sync';

const optionsSync = new OptionsSync({
	defaults: {
		colorRed: 244,
		colorGreen: 67,
		colorBlue: 54,
		text: 'Set a text!',
		customTimezone: 'Africa/Ceuta',
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	logging: true,
});

export default optionsSync;
