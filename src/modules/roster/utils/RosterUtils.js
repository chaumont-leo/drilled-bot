const {EmbedBuilder} = require("discord.js");
const configManager = require('../../../config/ConfigManager');

const refreshRosters = async (guild, roles, optionalChannel = null, optionalRole = null) => {
	try {
		const baseRoster = getBaseRoster(guild.members.cache, roles);

		if(optionalRole && optionalChannel) {
			const roster = filterRoster(baseRoster, optionalRole.id);
			const embed = formatEmbed(roster, optionalRole.name)

			await clearChannel(optionalChannel)

			return optionalChannel.send({embeds: [embed]});
		}

		const rosters = [];

		const channels = [];

		const fullRoster = configManager.getConfigValue('roster.fullRoster');

		if(fullRoster.active) {
			const channel = await guild.channels.fetch(fullRoster.channel);
			channels.push(channel);
			rosters.push({ roster: baseRoster, role: null, channel });
		}

		const specificRosters = configManager.getConfigValue('roster.specificRosters');

		rosters.push(...specificRosters.map(async (roster) => {
			const [role, channel] = await Promise.all([
				guild.roles.fetch(roster.role),
				guild.channels.fetch(roster.channel)
			]);

			if(!channels.map(chan => chan.id).includes(roster.id)) channels.push(channel);

			const filteredRoster = filterRoster(baseRoster, roster.role);
			return { roster: filteredRoster, role, channel };
		}));

		await Promise.all(channels.map(channel => clearChannel(channel)));

		for (const roster of rosters) {
			roster.channel.send({ embeds: [formatEmbed(roster.roster, roster.name ?? null)] })
		}
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
					members.push(member)
					return members;
				}, [])
			};
		}).reduce((acc, role) => {
			const members = role.members.filter(member => !acc.seen.some(id => id === member.id));
			acc.roles.push({id: role.id, members: members});
			acc.seen.push(...members.map(member => member.id));
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
			? roleMember.members.map(member => `\n• <@${member.id}>`).join('')
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

const clearChannel = async (channel) => {
	try {
		const fetched = await channel.messages.fetch({ limit: 100 });
		await channel.bulkDelete(fetched);
	} catch (e) {
		console.error(e);
	}
}

module.exports = {
	refreshRosters
}