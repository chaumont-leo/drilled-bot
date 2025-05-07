const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require("discord.js");

module.exports = {
	name: 'clear',
	description: 'Supprime les messages',
	options: [],
	run: async (client, interaction) => {
		const fetched = await interaction.channel.messages.fetch({ limit: 100 });
		await interaction.channel.bulkDelete(fetched);

		await interaction.reply();
	}
}