const {SlashCommandBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,EmbedBuilder,ActionRowBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Opens a support sequence for issues related to the AJHS system'),
    
    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
        .setCustomId('supportMenu')
        .setPlaceholder('Choose the option that matches with your situation!')
        .addOptions(
            new StringSelectMenuOptionBuilder()
            .setValue('supportRequest')
            .setLabel('Support request/Question')
            .setDescription(`You're experiencing issues with AJHS and need support.`),
            new StringSelectMenuOptionBuilder()
            .setValue('bugReport')
            .setLabel('Bug report')
            .setDescription(`You've found a bug and wish to inform us.`)
        )

        const row = new ActionRowBuilder()
        .addComponents(menu)

        interaction.reply({
            content : 'Please make a choice!',
            components : [row],
            ephemeral : true
        })
    }
}