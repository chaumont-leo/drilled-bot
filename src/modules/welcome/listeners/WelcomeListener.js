const {AttachmentBuilder, EmbedBuilder} = require("discord.js");
const {join} = require("path");

const BaseListener = require('../../BaseListener');
const configManager = require('../../../config/ConfigManager');

class WelcomeListener extends BaseListener {
	constructor(client) {
		super(client);
		this.active = configManager.getConfigValue('welcome.active');
	}

	handle() {
		this.client.on('guildMemberAdd', async (member) => {

			console.log('join');

			const attachments = this.getAttachments()
				.map(attachment => new AttachmentBuilder(join(__dirname, `../../../assets/${attachment}`)));

			try {
				const channel = configManager.getConfigValue('welcome.channel')
					? await member.guild.channels.fetch(configManager.getConfigValue('welcome.channel'))
					: member.guild.systemChannel;

				if (channel) {
					const embed = new EmbedBuilder();

					this.checkAndSetIfActive('title', (value) => embed.setTitle(value));
					this.checkAndSetIfActive('color', (value) => embed.setColor(value));
					this.checkAndSetIfActive('description', (value) => embed.setDescription(this.getFormattedDescription(value, member)));

					this.setupThumbnail(embed);

					this.setupFooter(embed);

					await channel.send({ embeds: [embed], files: attachments });
				}

				if(configManager.getConfigValue('welcome.baseRole')) {
					await member.roles.add(configManager.getConfigValue('welcome.baseRole'))
				}
			} catch (e) {
				console.error(e);
			}
		})
	}

	getAttachments() {
		const attachments = new Set();
		this.checkAndSetIfActive('logoPath', (value) => { attachments.add(value); });
		this.checkAndSetIfActive('footer.iconPath', (value) => { attachments.add(value); });
		return Array.from(attachments);
	}

	checkAndSetIfActive(property, cb) {
		const value = configManager.getConfigValue(`welcome.embedMessage.${property}`);
		if(value) cb(value);
	}

	getFormattedDescription(rawDescription, member) {
		return rawDescription
			.replaceAll('%member%', member)
			.replaceAll('%count%', member.guild.memberCount)
			.replaceAll('%ticketChannel%', `<#${configManager.getConfigValue('ticket.channel')}>`)
	}

	setupThumbnail(embed) {
		if(configManager.getConfigValue('welcome.embedMessage.thumbnail') === 'LOGO') {
			const path = configManager.getConfigValue('welcome.embedMessage.logoPath')
			if(path) embed.setThumbnail(`attachment://${path}`);
		}
	}

	setupFooter(embed) {
		if(configManager.getConfigValue('welcome.embedMessage.footer.active')) {
			const footer = {};

			const icon = configManager.getConfigValue('welcome.embedMessage.footer.icon');
			const iconPath = configManager.getConfigValue('welcome.embedMessage.footer.iconPath');
			if(icon && iconPath) footer.iconURL = `attachment://${iconPath}`;

			const text = configManager.getConfigValue('welcome.embedMessage.footer.text');
			if(text) footer.text = text;

			embed.setFooter(footer);

			if(configManager.getConfigValue('welcome.embedMessage.footer.timestamp')) {
				embed.setTimestamp();
			}
		}
	}
}

module.exports = WelcomeListener;