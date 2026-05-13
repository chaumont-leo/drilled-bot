const { PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

const { refreshRosters } = require('../utils/RosterUtils');

const configManager = require('../../../config/ConfigManager');


module.exports = {
	name: 'roster',
	description: 'Affiche le roster',
	active: configManager.getConfigValue('roster.active'),
	options: [
		{
			name: "role",
			description: "Définissez un role que l'utilisateur doit avoir",
			type: ApplicationCommandOptionType.Role,
			required: false
		},
		{
			name: "only_base_roster",
			description: "Choisissez d'afficher uniquement le roster de base",
			type: ApplicationCommandOptionType.Boolean,
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

		const optionalRole = interaction.options.getRole("role") ?? null;

		const here = interaction.options.getBoolean("here") ?? false;

		const onlyBaseRoster = interaction.options.getBoolean("only_base_roster") ?? false;

		const roles = configManager.getConfigValue('roster.roles');

		if(!roles || roles.length === 0) return interaction.reply({
			content: 'Aucun roles n\'a été défini pour le roster.',
			flags: 64
		});

		try {
			await interaction.guild.members.fetch();
		} catch (e) {
			console.error(e);
		}
		try {
			const channel = here ? interaction.channel : null;

			await refreshRosters(interaction.guild, roles, channel, optionalRole, onlyBaseRoster);

			return interaction.reply({ content: `Le roster a été actualisé avec succès !`, flags: 64});
		} catch (e) {
			console.error(e);
			return interaction.reply({
				content: 'Une erreur est survenue !',
				flags: 64
			});
		}
	}
}