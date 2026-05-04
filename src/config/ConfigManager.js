const fs = require('fs');
const path = require('path');
const _ = require('lodash');

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
		return this.config ? _.get(this.config, valuePath, null) : null;
	}

}

module.exports = new ConfigManager();