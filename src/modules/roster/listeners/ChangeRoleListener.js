const { EmbedBuilder } = require("discord.js");

const BaseListener = require('../../BaseListener');
const configManager = require('../../../config/ConfigManager');
const { refreshRosters } = require('../utils/RosterUtils');

class WelcomeListener extends BaseListener {
	constructor(client) {
		super(client);
		this.active = configManager.getConfigValue('roster.active');
		this.rosterRoles = this.getRosterRoles();
		this.roles = [...this.rosterRoles, ...this.getSpecificRoles()];
	}

	handle() {
		this.client.on('guildMemberUpdate', async (oldMember, newMember) => {

			if(this.roles.length === 0) return;

			const oldRoleIds = new Set(oldMember.roles.cache.map(r => r.id));
			const newRoleIds = new Set(newMember.roles.cache.map(r => r.id));

			const addedRoles = [...newRoleIds].filter(id => !oldRoleIds.has(id));
			const removedRoles = [...oldRoleIds].filter(id => !newRoleIds.has(id));

			if([...addedRoles, ...removedRoles].filter(id => this.roles.includes(id)).length === 0) return;

			await this.tryRefreshRoster(newMember);

			const oldRosterMember = Array.from(oldRoleIds).some(id => this.rosterRoles.includes(id));
			const newRosterMember = Array.from(newRoleIds).some(id => this.rosterRoles.includes(id));

			const oldHighestRosterRoleId = Array.from(oldRoleIds).reduce((acc, roleId) => {
				const rosterRoleIndex = this.rosterRoles.findIndex(roleId);
				if(rosterRoleIndex > acc) acc = rosterRoleIndex;
				return acc;
			}, -1);

			const newHighestRosterRoleId = Array.from(oldRoleIds).reduce((acc, roleId) => {
				const rosterRoleIndex = this.rosterRoles.findIndex(roleId);
				if(rosterRoleIndex > acc) acc = rosterRoleIndex;
				return acc;
			}, -1);

			if(oldRosterMember && !newRosterMember) {
				await this.sendMessage('quitMessage', newMember)
			} else if(!oldRosterMember && newRosterMember) {
				await this.sendMessage('joinMessage', newMember)
			} else if(newHighestRosterRoleId > oldHighestRosterRoleId) {
				await this.sendMessage('promotionMessage', newHighestRosterRoleId, newHighestRosterRoleId);
			}

		})
	}

	async tryRefreshRoster(member) {
		try {
			await member.guild.members.fetch();
			await refreshRosters(member.guild, this.rosterRoles);
		} catch (e) {
			console.error(e);
		}
	}

	async sendMessage(eventId, member, roleId = null) {
		const roleChangeConfig = configManager.getConfigValue('roster.roleChange');
		if(!roleChangeConfig.active || !roleChangeConfig.channel || !roleChangeConfig[eventId]) return;

		try {
			const factionRoleChannel = await member.guild.channels.cache.get(roleChangeConfig.channel);
			const embed = new EmbedBuilder()
				.setTitle(roleChangeConfig[eventId].title)
				.setColor(roleChangeConfig[eventId].color ?? '#ffffff')
				.setDescription(this.formatDescription(roleChangeConfig[eventId].description, member, roleId))
				.setTimestamp();
			await factionRoleChannel.send({ embeds: [embed] });
		} catch (e) {
			console.error(e);
		}
	}

	formatDescription(rawDescription, member, roleId) {
		const description = rawDescription
			.replaceAll('%member%', `${member}`)
		return roleId
			? description.replaceAll('%role%', `<@&${roleId}>`)
			: description;
	}

	getRosterRoles() {
		return configManager.getConfigValue('roster.roles') ?? [];
	}

	getSpecificRoles() {
		const specificRosters = configManager.getConfigValue('roster.specificRosters');
		return Array.isArray(specificRosters) && specificRosters.length > 0
			? specificRosters.map(specificRoster => specificRoster.role)
			: [];
	}
}

module.exports = WelcomeListener;