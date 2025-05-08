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

			if(!this.factionRoles || this.factionRoles.size === 0) return;

			const addedRoles = newMember.roles.cache.difference(oldMember.roles.cache);
			const removedRoles = oldMember.roles.cache.difference(newMember.roles.cache);

			if(addedRoles.size > 0) await this.handleAddRoles(newMember, addedRoles);
			if(removedRoles.size > 0) await this.handleRemoveRoles(newMember, removedRoles);

		})
	}

	async handleAddRoles(member, roles) {
		const roleId = roles
			.map(role => role.id)
			.find(roleId => this.factionRoles.includes(roleId))

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
		const roleId = roles
			.map(role => role.id)
			.find(roleId => this.factionRoles.includes(roleId))

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
			await refreshRoster(channel, this.factionRoles, member.guild.members.cache);
		} catch (e) {
			console.error(e);
		}
	}
}

module.exports = WelcomeListener;