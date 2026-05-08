const {EmbedBuilder} = require("discord.js");
const configManager = require('../../../config/ConfigManager');

const refreshRoster = async (channel, roles, guildMembers, optionalRole = null) => {
	try {
		const fetched = await channel.messages.fetch({ limit: 100 });
		await channel.bulkDelete(fetched);

		const baseRoster = getBaseRoster(guildMembers, roles);

		if(optionalRole) {
			const roster = filterRoster(baseRoster, guildMembers, optionalRole.id);
			const embed = formatEmbed(roster, optionalRole.name)
			return channel.send({embeds: [embed]});
		}

		const rosters = [];

		const fullRoster = configManager.getConfigValue('roster.fullRoster.active');

		if(fullRoster)
			rosters.push({ roster: fullRoster, role: null });

		const specificRosters = configManager.getConfigValue('roster.specificRosters');



		return channel.send({embeds: [embed]});
	} catch (e) {
		console.error(e);
		throw e;
	}

}

const getBaseRoster = (guildMembers, roles) => {
	return roles
		.map(role => {
			return {
				id: role,
				members: guildMembers.reduce((members, member) => {
					if (!member.roles.cache.some(memberRole => memberRole.id === role))
						return members;
					members.push(member.id)
					return members;
				}, [])
			};
		}).reduce((acc, role) => {
			const members = role.members.filter(member => !acc.seen.some(id => id === member));
			acc.roles.push({id: role.id, members: members});
			acc.seen.push(...members);
			return acc;
		}, { roles: [], seen: [] })
		.roles;
}

const filterRoster = (baseRoster, roleId) => {
	return baseRoster
		.map(role => ({
			id: role.id,
			members: role.members.filter(member => member.roles.cache.some(role => role.id === roleId))
		}))
}

const formatDescription = (roster) => {
	return roster.map(roleMember => {
		const roleTitle = `<@&${roleMember.id}> [${roleMember.members.length}] \n`;
		const roleList = roleMember.members.length > 0
			? roleMember.members.map(member => `\n• <@${member}>`).join('')
			: '\n• À venir...';
		return roleTitle + roleList
	}).join('\n\n')
}

const formatEmbed = (roster, roleName = null) => {
	return new EmbedBuilder()
		.setColor('#ffffff')
		.setTitle(`:gem:︱**EFFECTIF ACTUEL – ${ roster.map(r => r.members).flat().length } MEMBRES${roleName ? ` - ${roleName} `: ''}**`)
		.setDescription(formatDescription(roster));
}

module.exports = {
	refreshRoster
}