const { PermissionsBitField } = require("discord.js");

module.exports = {
	name: 'clear',
	description: 'Supprime les messages',
	options: [],
	run: async (client, interaction) => {
		try {
			if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				return await interaction.reply({ content: 'Tu n’as pas la permission d’utiliser cette commande.', flags: 64 });
			}

			const fetched = await interaction.channel.messages.fetch({ limit: 100 });
			await interaction.channel.bulkDelete(fetched);

			await interaction.reply({ content: 'Messages supprimés avec succès', flags: 64 });
		} catch (e) {
			console.error(e);
			await interaction.reply({ content: 'Une erreur est survenue.', flags: 64 });
		}
	}
}