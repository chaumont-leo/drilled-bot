const { ApplicationCommandOptionType } = require("discord.js");
const configManager = require('../../../config/ConfigManager');

module.exports = {
	name: 'add',
	description: 'Ajoute un user au ticket',
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

		await interaction.channel.permissionOverwrites.edit(member.id, {
			ViewChannel: true,
			SendMessages: true,
			AttachFiles: true,
			ReadMessageHistory: true,
		})

		return interaction.reply({ content: `L\'utilisateur <@${member.id}> a été ajouté au ticket`});
	}
}