const { EmbedBuilder } = require("discord.js");

const BaseListener = require('../../BaseListener');
const configManager = require('../../../config/ConfigManager');
const { refreshRoster } = require('../utils/RosterUtils');

class WelcomeListener extends BaseListener {
	constructor(client) {
		super(client);
		this.factionRoles = configManager.getConfigValue('roster.roles');
		this.factionRoleChannelId = configManager.getConfigValue('roster.roleChangeChannel');
	}

	handle() {
		this.client.on('guildMemberUpdate', async (oldMember, newMember) => {

			if(!this.factionRoles || this.factionRoles.length === 0) return;

			const oldRoleIds = new Set(oldMember.roles.cache.map(r => r.id));
			const newRoleIds = new Set(newMember.roles.cache.map(r => r.id));

			const addedRoles = [...newRoleIds].filter(id => !oldRoleIds.has(id));
			const removedRoles = [...oldRoleIds].filter(id => !newRoleIds.has(id));

			if(addedRoles.length > 0) await this.handleAddRoles(newMember, addedRoles);
			if(removedRoles.length > 0) await this.handleRemoveRoles(newMember, removedRoles);

		})
	}

	async handleAddRoles(member, roles) {
		const roleId = roles.find(roleId => this.factionRoles.includes(roleId))

		if(!roleId) return;

		await this.tryRefreshRoster(member);

		if(!this.factionRoleChannelId) return;

		try {
			const factionRoleChannel = await member.guild.channels.fetch(this.factionRoleChannelId);
			const embed = new EmbedBuilder()
				.setTitle('**Une promotion**')
				.setColor('#ffffff') // Vous pouvez définir des couleurs avec des chaînes de caractères hexadécimales, des nombres ou des strings prédéfinis
				.setDescription(`Le joueur ${member} est désormais promu au rang de <@&${roleId}> ! \n Félicitations pour cette promotion !`)
				.setTimestamp();
			await factionRoleChannel.send({ embeds: [embed] });
		} catch (e) {
			console.error(e);
		}
	}

	async handleRemoveRoles(member, roles) {
		const roleId = roles.find(roleId => this.factionRoles.includes(roleId))

		if(!roleId) return;

		await this.tryRefreshRoster(member);

		if(!this.factionRoleChannelId) return;

		if(!member.roles.cache
			.map(role => role.id)
			.some(roleId => this.factionRoles.includes(roleId))) {
			try {
				const factionRoleChannel = await member.guild.channels.fetch(this.factionRoleChannelId);
				const embed = new EmbedBuilder()
					.setTitle('**Fin d\'une aventure**')
					.setColor('#ffffff') // Vous pouvez définir des couleurs avec des chaînes de caractères hexadécimales, des nombres ou des strings prédéfinis
					.setDescription(`Le joueur ${member} ne fait désormais plus partie de la Drilled !`)
					.setTimestamp();
				await factionRoleChannel.send({ embeds: [embed] });
			} catch (e) {
				console.error(e);
			}
		}
	}


	async tryRefreshRoster(member) {
		try {
			const rosterChannelId = configManager.getConfigValue('roster.channel');
			if(!rosterChannelId) return;
			const channel = await member.guild.channels.fetch(rosterChannelId);
			await member.guild.members.fetch();
			await refreshRoster(channel, this.factionRoles, member.guild.members.cache);
		} catch (e) {
			console.error(e);
		}
	}
}

module.exports = WelcomeListener;