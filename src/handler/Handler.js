const fs = require('fs');
const path = require('path');
class Handler {

	constructor(client) {
		this.client = client;
		this.modulesDirectory = path.join(__dirname,'..', 'modules');
		this.modules = fs.readdirSync(this.modulesDirectory)
			.filter(pathFile => fs.lstatSync(path.join(this.modulesDirectory, pathFile)).isDirectory())
		this.buttonHandlers = []
	}

	async handleModules() {
		for (const module of this.modules) {
			const modulePath = `${this.modulesDirectory}/${module}`
			const folders = fs.readdirSync(modulePath)
			for (const folder of folders) {
				const folderPath =  `${modulePath}/${folder}`
				switch (folder) {
					case 'listeners': this.handleListeners(folderPath); break;
					case 'commands': await this.handleCommands(folderPath); break;
					case 'buttons': this.handleButtons(folderPath)
				}
			}
		}

		this.client.on('ready', async () => {
			console.log(`Bot is ready as: ${this.client.user.tag}`);
			console.log("Connected to the following servers:");
			this.client.guilds.cache.forEach(guild => {
				console.log(` - ${guild.name} (id: ${guild.id})`);
			});
			const arrayOfSlashCommands = Array.from(this.client.commands.values());
			await this.client.application.commands.set(arrayOfSlashCommands);
		});

		this.client.on('interactionCreate', async (interaction) => {
			if(interaction.isChatInputCommand()) {
				if (!interaction.isChatInputCommand()) return;

				const command = this.client.commands.get(interaction.commandName);
				if (!command) return;

				try {
					await command.run(this.client, interaction);
				} catch (err) {
					console.error(err);
					if (!interaction.replied) {
						await interaction.reply({ content: '❌ Une erreur est survenue.', flags: 64 });
					}
				}
			} else if(interaction.isButton()) {
				const buttonHandler = this.buttonHandlers.find(buttonHandler => buttonHandler.id === interaction.customId);
				if (buttonHandler) {
					await buttonHandler.run(this.client, interaction);
				} else {
					await interaction.reply('Bouton inconnu.');
				}
			}
		});

	}

	handleListeners(folderPath) {
		fs.readdirSync(folderPath).forEach((moduleDir) => {
			const Module = require(path.join(folderPath, moduleDir));
			(new Module(this.client)).handle();
		});
	}

	async handleCommands(folderPath) {
		for (const commandFile of fs.readdirSync(folderPath)) {
			const command = require(path.join(folderPath, commandFile));
			if(command?.name) await this.client.commands.set(command.name, command);
		}
	}

	handleButtons(folderPath) {
		fs.readdirSync(folderPath).forEach((buttonFile) => {
			const button = require(path.join(folderPath, buttonFile));
			this.buttonHandlers.push(button);
		});
	}
}

module.exports = Handler;