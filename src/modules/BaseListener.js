class BaseListener {
	/**
	 * @param client {Client}
	 */
	constructor(client) {
		this.client = client;
	}

	handle() {
		console.log(`Start Handling events from modules ...`);
	}
}

module.exports = BaseListener;