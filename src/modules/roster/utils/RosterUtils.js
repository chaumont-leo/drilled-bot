const {EmbedBuilder} = require("discord.js");
const configManager = require('../../../config/ConfigManager');
const refreshRoster = async (channel, roles, guildMembers) => {

	const channelId = configManager.getConfigValue('roster.channel');

	if(!channelId) throw new Error('No channel specified');

	try {
		const rolesMembers = roles
			.map(role => {
				return  {
					id: role,
					members: guildMembers
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

		return channel.send({embeds: [embed]});
	} catch (e) {
		console.error(e);
		throw e;
	}

}

module.exports = {
	refreshRoster
}