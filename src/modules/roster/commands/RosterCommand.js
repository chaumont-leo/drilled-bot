const { ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField} = require("discord.js");

const configManager = require('../../../config/ConfigManager');


module.exports = {
	name: 'roster',
	description: 'Affiche le roster',
	options: [],
	run: async (client, interaction) => {

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return await interaction.reply({ content: 'Tu n’as pas la permission d’utiliser cette commande.', flags: 64 });
		}

		const roles = configManager.getConfigValue('roster.roles');

		if(!roles || roles.length === 0) return interaction.reply({
			content: 'Aucun roles n\'a été défini pour le roster.',
			flags: 64
		});

		const fetched = await interaction.channel.messages.fetch({ limit: 100 });
		await interaction.channel.bulkDelete(fetched);

		try {
			await interaction.guild.members.fetch();
			const rolesMembers = roles
				.map(role => {
					return  {
						id: role,
						members: interaction.guild.members.cache
							.filter(member => member.roles.cache.some(memberRole => memberRole.id === role))
							.map(member => member.id)
					};
				})
				.reduce((acc, role) => {
					const members = role.members.filter(member => !acc.seen.some(id => id === member));
					acc.roles.push({id: role.id, members: members});
					acc.seen.push(...members);
					return acc;
				}, { roles: [], seen: [] })
				.roles;

			const description = rolesMembers.map(roleMember => {
					const roleTitle = `<@&${roleMember.id}> [${roleMember.members.length}] \n`;
					const roleList = roleMember.members.length > 0
						? roleMember.members.map(member => `\n• <@${member}>`).join('')
						: '\n• À venir...';
					return roleTitle + roleList
				}).join('\n\n')

			const embed = new EmbedBuilder()
				.setColor('#ffffff')
				.setTitle(`:gem:︱**EFFECTIF ACTUEL – ${ rolesMembers.map(r => r.members).flat().length } MEMBRES**`)
				.setDescription(description);

			return interaction.reply({embeds: [embed]});
		} catch (e) {
			console.error(e);
			return interaction.reply({
				content: 'Une erreur est survenue !',
				flags: 64
			});
		}
	}
}