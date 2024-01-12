const {
    TextInputStyle,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle
} =  require('discord.js')


module.exports = {

    data : new SlashCommandBuilder()
    .setName('suggest')
    .setDescription(`You've a suggestion and wish to inform us.`),
    
    async execute(interaction) {
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

        const submit = await interaction.awaitModalSubmit({
            time: 120000
        }).catch((err)=>{
            console.log(err)
            return null
        })

        if (submit) {
            this.executePartTwo(submit)
        }

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
        .setColor('#00ffbb');

        const approve = new ButtonBuilder()
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setCustomId('approveSuggestionButton')

        const reject = new ButtonBuilder()
        .setLabel('Reject')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('rejectSuggestiontButton')

        const row = new ActionRowBuilder()
        .addComponents(approve,reject)

        suggestionChannel.send({
            content : 'A new suggestion was submitted! <@&1188849190193860720>',
            embeds : [embed],
            components : [row]
        }).catch((err)=>console.log(err))

    },

    async approve(interaction) {
        const username = interaction.message.embeds[0].data.author.name
        const guild = interaction.guild
        const collection = await guild.members.search({query : username})
        const member = collection.find(u => u.user.globalName == username)

        try {
            member.send({
                content : `Your suggestion has been approved. We're working on implementing it.`
            })
            interaction.reply({
                content : `Approved suggestion.`,
                ephemeral : true
            })
        } catch (err) {console.log(err)}
    }
}