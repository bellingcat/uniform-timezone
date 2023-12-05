function getLang() {
	if (navigator.languages !== undefined) {
		return navigator.languages[0];
	}

	return navigator.language;
}

// Export all functions here defined
export {getLang};
