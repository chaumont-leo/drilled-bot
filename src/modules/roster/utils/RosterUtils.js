const {EmbedBuilder} = require("discord.js");
const refreshRoster = async (channel, roles, guildMembers, optionalRole = null) => {
	try {

		const fetched = await channel.messages.fetch({ limit: 100 });
		await channel.bulkDelete(fetched);

		const rolesMembers = roles
			.map(role => {
				return  {
					id: role,
					members: guildMembers.reduce((members, member) => {
						if(optionalRole && !member.roles.cache.some(memberRole => memberRole.id === optionalRole))
							return members;
						if(!member.roles.cache.some(memberRole => memberRole.id === role))
							return members;
						members.push(member.id)
					}, [])
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
			.setTitle(`:gem:︱**EFFECTIF ACTUEL – ${ rolesMembers.map(r => r.members).flat().length } MEMBRES${optionalRole ? ` (<@${optionalRole}>)`: ''}**`)
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