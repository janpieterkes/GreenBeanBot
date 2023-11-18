const {
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    EmbedBuilder
} =  require('discord.js')


module.exports = {
    async executePartOne(interaction) {
        const modal = new ModalBuilder()
        .setCustomId('suggestion')
        .setTitle('Suggestion Menu')
        const sugText = new TextInputBuilder()
        .setCustomId('sugInput')
        .setLabel(`What's you suggestion?`)
        .setMaxLength(1000)
        .setStyle(TextInputStyle.Paragraph)
        const reasonText = new TextInputBuilder()
        .setCustomId('reaonInput')
        .setLabel('Why should we add this suggestion?')
        .setMaxLength(1000)
        .setStyle(TextInputStyle.Paragraph)
        const firstRow = new ActionRowBuilder().addComponents(sugText)
        const secondRow = new ActionRowBuilder().addComponents(reasonText)
        modal.addComponents(firstRow,secondRow)
        await interaction.showModal(modal)
    },

    async executePartTwo(interaction) {
        interaction.reply({
            content : 'Your suggestion has been successfully recorded :white_check_mark:!',
            ephemeral : true
        })

        const fieldOneText = await interaction.fields.getField('sugInput').value
        const fieldTwoText = await interaction.fields.getField('reaonInput').value

        const suggestionChannel = await interaction.client.channels.fetch('1175391466919579648')

        const embed = new EmbedBuilder()
        .setAuthor({
            name : interaction.user.globalName,
            iconURL : `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`
        })
        .addFields(
            {name : `What's your suggestion?`, value : fieldOneText},
            {name : `Why should we add this suggestion?`, value : fieldTwoText}
        )
        .setColor('#00ffbb')

        suggestionChannel.send({
            content : 'A new suggestion was submitted!',
            embeds : [embed]
        }).catch((err)=>console.log(err))
    }
}