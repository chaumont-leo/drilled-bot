const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField} = require("discord.js");

const configManager = require('../../../config/ConfigManager');

module.exports = {
	name: 'init',
	description: 'Génère le message pour les tickets',
	active: configManager.getConfigValue('ticket.active'),
	options: [],
	run: async (client, interaction) => {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.reply({ content: 'Tu n’as pas la permission d’utiliser cette commande.', flags: 64 });
		}
		const embed = new EmbedBuilder()
			.setColor('#ffffff')
			.setTitle(configManager.getConfigValue('ticket.channelEmbedMessage.title'))
			.setDescription(configManager.getConfigValue('ticket.channelEmbedMessage.content'));

		const button = new ButtonBuilder()
			.setCustomId('create_ticket')
			.setLabel(configManager.getConfigValue('ticket.channelEmbedMessage.button'))
			.setStyle(1);

		const row = new ActionRowBuilder()
			.addComponents(button);

		await interaction.reply({ embeds: [embed], components: [row] });
	}
}