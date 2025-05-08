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

			const oldRoleIds = new Set(oldMember.roles.cache);
			const newRoleIds = new Set(newMember.roles.cache);

			const addedRoles = [...newRoleIds].filter(role => !oldRoleIds.map(role => role.id).has(role.id));
			const removedRoles = [...oldRoleIds].filter(role => !newRoleIds.map(role => role.id).has(role.id));

			// const addedRoles = newMember.roles.cache.difference(oldMember.roles.cache);
			console.log('Roles Ajoutés', addedRoles.map(role => role.id));
			// const removedRoles = oldMember.roles.cache.difference(newMember.roles.cache);
			console.log('Roles Retirés', removedRoles.map(role => role.id));
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
			await member.guild.members.fetch();
			await refreshRoster(channel, this.factionRoles, member.guild.members.cache);
		} catch (e) {
			console.error(e);
		}
	}
}

module.exports = WelcomeListener;