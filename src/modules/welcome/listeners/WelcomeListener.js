const {AttachmentBuilder, EmbedBuilder} = require("discord.js");
const {join} = require("path");

const BaseListener = require('../../BaseListener');
const configManager = require('../../../config/ConfigManager');

class WelcomeListener extends BaseListener {
	constructor(client) {
		super(client);
	}

	handle() {
		this.client.on('guildMemberAdd', async (member) => {
			const attachments = ['logo', 'logoWithoutBg']
				.map(attachment => new AttachmentBuilder(join(__dirname, `../../../assets/${attachment}.png`)));

			try {
				const channel = configManager.getConfigValue('welcome.channel')
					? await member.guild.channels.fetch(configManager.getConfigValue('welcome.channel'))
					: member.guild.systemChannel;

				const ticketChannelId = configManager.getConfigValue('ticket.channel');

				if (channel) {
					const embed = new EmbedBuilder()
						.setTitle('**Bienvenue chez la DRILLED**')
						.setColor('#ffffff') // Vous pouvez définir des couleurs avec des chaînes de caractères hexadécimales, des nombres ou des strings prédéfinis
						.setDescription(`Bienvenue ${member} ! #${member.guild.memberCount} \n Si tu souhaites être recruté ouvre un ticket \n <#${ticketChannelId}>`)
						.setThumbnail('attachment://logo.png')
						.setFooter({
							text: 'DRILLED',
							iconURL: 'attachment://logoWithoutBg.png'
						})
						.setTimestamp();
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
}

module.exports = WelcomeListener;