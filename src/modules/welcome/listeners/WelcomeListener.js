const {AttachmentBuilder, EmbedBuilder} = require("discord.js");
const {join} = require("path");

const BaseListener = require('../../BaseListener');

class WelcomeListener extends BaseListener {
	constructor(client) {
		super(client);
	}

	handle() {
		this.client.on('guildMemberAdd', async (member) => {
			const attachments = ['logo', 'logoWithoutBg']
				.map(attachment => new AttachmentBuilder(join(__dirname, `../../../assets/${attachment}.png`)));

			const channel = member.guild.systemChannel;

			if (channel) {
				const embed = new EmbedBuilder()
					.setTitle('**Bienvenue chez la DRILLED**')
					.setColor('#ffffff') // Vous pouvez définir des couleurs avec des chaînes de caractères hexadécimales, des nombres ou des strings prédéfinis
					.setDescription(`Bienvenue ${member} ! #${member.guild.memberCount} \n Si tu souhaites être recruté ouvre un ticket \n <#${process.env.WELCOME_CHANNEL_ID}>`)
					.setThumbnail('attachment://logo.png')
					.setFooter({
						text: 'DRILLED',
						iconURL: 'attachment://logoWithoutBg.png'
					})
					.setTimestamp();
				await channel.send({ embeds: [embed], files: attachments });
			}

			if(process.env.BASE_ROLE_ID) {
				await member.roles.add(process.env.BASE_ROLE_ID)
			}
		})
	}
}

module.exports = WelcomeListener;