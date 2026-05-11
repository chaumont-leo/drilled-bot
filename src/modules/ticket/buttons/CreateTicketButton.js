const { PermissionFlagsBits, ChannelType, ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js')
const configManager = require('../../../config/ConfigManager');

const ticketConfig = configManager.getConfigValue('ticket');

module.exports = {
	id: 'create_ticket',
	active: ticketConfig.active,
	run: async (client, interaction) => {
		const member = interaction.member;
		try {
			const channelConfig = {
				name: `ticket-${member?.user.globalName}`,
				type: ChannelType.GuildText,
				permissionOverwrites: [
					{
						id: interaction.guild.id,
						deny: [PermissionFlagsBits.ViewChannel],
					},
					{
						id: member.id,
						allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
							PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory],
					},
					{
						id: configManager.getConfigValue('ticket.supportRole'),
						allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
							PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory],
					},
					{
						id: interaction.guild.members.me.id,
						allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
							PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory],
					}
				],
			}

			if(ticketConfig.categoryId) channelConfig.parent = ticketConfig.categoryId;

			const channel = await interaction.guild.channels.create(channelConfig)

			const embed = new EmbedBuilder()
				.setColor('#ffffff')
				.setDescription(configManager.getConfigValue('ticket.ticketEmbedMessage.content'));

			const button = new ButtonBuilder()
				.setCustomId('close_ticket')
				.setLabel(configManager.getConfigValue('ticket.ticketEmbedMessage.button'))
				.setStyle(4);

			const row = new ActionRowBuilder()
				.addComponents(button);

			if(ticketConfig.ticketForm) {
				await channel.send("```\n" + ticketConfig.ticketForm + "\n```");
			}

			await channel.send({embeds: [embed], components: [row]});
			return interaction.reply({content: `Ticket créé : <#${channel.id}>`, flags: 64});
		} catch (err) {
			console.error(err);
			return interaction.reply({ content: 'Une erreur est survenue lors de la création du ticket.', flags: 64 });
		}
	}
}