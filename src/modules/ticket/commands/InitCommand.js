const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField} = require("discord.js");

module.exports = {
	name: 'init',
	description: 'Génère le message pour les tickets',
	options: [],
	run: async (client, interaction) => {
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.reply({ content: 'Tu n’as pas la permission d’utiliser cette commande.', flags: 64 });
		}
		const embed = new EmbedBuilder()
			.setColor('#ffffff')
			.setTitle('Recrutement')
			.setDescription('Pour créer un ticket, cliquez sur le bouton !');

		const button = new ButtonBuilder()
			.setCustomId('create_ticket')
			.setLabel('Ouvrir un ticket')
			.setStyle(1);

		const row = new ActionRowBuilder()
			.addComponents(button);

		await interaction.reply({ embeds: [embed], components: [row] });
	}
}