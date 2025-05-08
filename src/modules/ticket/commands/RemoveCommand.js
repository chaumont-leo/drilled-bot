const { ApplicationCommandOptionType } = require("discord.js");
const configManager = require('../../../config/ConfigManager');

module.exports = {
	name: 'remove',
	description: 'Retire un user du ticket',
	options: [
		{
			name: "utilisateur",
			description: "Choisissez l'utilisateur que vous souhaitez ajouter au ticket.",
			type: ApplicationCommandOptionType.User,
			required: true
		}
	],
	run: async (client, interaction) => {

		if (!interaction.member.roles.cache.has(configManager.getConfigValue('support.role'))) {
			return await interaction.reply({ content: 'Tu n’as pas la permission d’utiliser cette commande.', flags: 64 });
		}

		const member = interaction.options.getMember("utilisateur");

		if(!member || !member.id) return interaction.reply({ content: 'L\'utilisateur choisi est invalide.', flags: 64 })

		await interaction.channel.permissionOverwrites.delete(member.id);

		return interaction.reply({ content: `L\'utilisateur <@${member.id}> a été retiré du ticket`});
	}
}