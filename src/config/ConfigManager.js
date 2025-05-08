const fs = require('fs');
const path = require('path');

class ConfigManager {
	config
	constructor() {
		try {
			const configPath = path.join(__dirname,'../..', 'config.json')
			this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
		} catch (e) {
			console.error(e);
		}
	}

	getConfigValue(valuePath) {
		return this.config ? valuePath.split('.').reduce((acc, part) => acc?.[part], this.config) : null;
	}

}

module.exports = new ConfigManager();