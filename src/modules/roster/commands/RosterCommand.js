const { PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

const { refreshRoster } = require('../utils/RosterUtils');

const configManager = require('../../../config/ConfigManager');


module.exports = {
	name: 'roster',
	description: 'Affiche le roster',
	options: [
		{
			name: "role",
			description: "Définissez un role que l'utilisateur doit avoir",
			type: ApplicationCommandOptionType.Role,
			required: false
		},
		{
			name: "here",
			description: "Actualiser le roster dans ce salon",
			type: ApplicationCommandOptionType.Boolean,
			required: false
}
	],
	run: async (client, interaction) => {

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.reply({ content: 'Tu n’as pas la permission d’utiliser cette commande.', flags: 64 });
		}

		const optionalRole = interaction.options.getMember("role") ?? null;

		const here = interaction.options.getMember("here") ?? false;

		const roles = configManager.getConfigValue('roster.roles');

		if(!roles || roles.length === 0) return interaction.reply({
			content: 'Aucun roles n\'a été défini pour le roster.',
			flags: 64
		});

		try {
			await interaction.guild.members.fetch();

			const channel = !here && configManager.getConfigValue('roster.channel')
				? await interaction.guild.channels.fetch(configManager.getConfigValue('roster.channel'))
				: interaction.channel;

			await refreshRoster(channel, roles, interaction.guild.members.cache, optionalRole);

			return interaction.reply({ content: `Le roster a été actualisé dans le channel <#${channel.id}> avec succès !`, flags: 64});
		} catch (e) {
			console.error(e);
			return interaction.reply({
				content: 'Une erreur est survenue !',
				flags: 64
			});
		}
	}
}