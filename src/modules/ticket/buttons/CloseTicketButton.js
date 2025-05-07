const {ButtonBuilder, ActionRowBuilder} = require("discord.js");
module.exports = {
	id: 'close_ticket',
	run: async (client, interaction) => {
		const message = await interaction.message;
		const oldButton = message.components[0].components[0];

		const disabledButton = ButtonBuilder.from(oldButton).setDisabled(true);
		const row = new ActionRowBuilder().addComponents(disabledButton);

		await message.edit({ components: [row] });

		await interaction.reply({ content: `Ticket fermé par <@${interaction.member.id}>` +
			'\nCe salon sera supprimé dans 5 secondes...'});

		setTimeout(() => {
			interaction.channel.delete()
				.catch(console.error);
		}, 5000);
	}
}