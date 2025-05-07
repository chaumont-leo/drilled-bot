const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
	name: 'clear',
	description: 'Supprime les messages',
	options: [],
	run: async (client, interaction) => {
		try {
			const fetched = await interaction.channel.messages.fetch({ limit: 100 });
			await interaction.channel.bulkDelete(fetched);

			await interaction.reply({ content: 'Messages supprimés avec succès', flags: 64 });
		} catch (e) {
			console.error(e);
			await interaction.reply({ content: 'Une erreur est survenue.', flags: 64 });
		}
	}
}