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


module.exports = { // The command itself and it's functionality are exported. The bot.js script loops trough all commands and deploys them (it also handles the execution).

    data : new SlashCommandBuilder() //  Build the command.
    .setName('suggest')
    .setDescription(`You've a suggestion and wish to inform us.`),
    
    async execute(interaction) { // Create a modal and show it. Let the user state their suggestion and record it.
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
        }) // The user has 120000 miliseconds to submit their interaction. If they don't meet this time the interaction is timed out.

        if (submit) { // After 120000 miliseconds (or earlier if the user finishes) it's checked if the modalInteraction was submited.
            this.executePartTwo(submit) // If yes start part 2 of the proccess.
        }

    },

    async executePartTwo(interaction) { // Reply to the original slashCommand and notifty the user of the submission.
        interaction.reply({
            content : 'Your suggestion has been successfully recorded :white_check_mark:!',
            ephemeral : true
        })

        const fieldOneText = await interaction.fields.getField('sugInput').value
        const fieldTwoText = await interaction.fields.getField('reaonInput').value
        // Load the text of the modal.

        const suggestionChannel = await interaction.client.channels.fetch('1175391466919579648')

        const embed = new EmbedBuilder() // Build an embed for the suggestion message.
        .setAuthor({
            name : interaction.user.globalName,
            iconURL : `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`
        })
        .addFields(
            {name : `What's your suggestion?`, value : fieldOneText},
            {name : `Why should we add this suggestion?`, value : fieldTwoText}
        )
        .setColor('#00ffbb');

        const approve = new ButtonBuilder() // Build an approve button and attach it to the suggestion message to aprrove it if needed.
        .setLabel('Approve')
        .setStyle(ButtonStyle.Success)
        .setCustomId('approveSuggestionButton')

        const reject = new ButtonBuilder() // Build a rejection button and attach it to the suggestion message to reject it if needed.
        .setLabel('Reject')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('rejectSuggestiontButton')

        const row = new ActionRowBuilder()
        .addComponents(approve,reject)

        suggestionChannel.send({ // Send the message, with the suggestion info.
            content : 'A new suggestion was submitted! <@&1188849190193860720>',
            embeds : [embed],
            components : [row]
        }).catch((err)=>console.log(err))

    },

    async approve(interaction) { // If the approve button is pressed this function will be fired from the botjs script.
        const username = interaction.message.embeds[0].data.author.name
        const guild = interaction.guild
        const collection = await guild.members.search({query : username})
        const member = collection.find(u => u.user.globalName == username)

        // Load the member object of the suggestion author.

        try {
            member.send({ // Send the suggestion author a DM explaining their suggestion was approved.
                content : `Your suggestion has been approved. We're working on implementing it.`
            })
            interaction.reply({
                content : `Approved suggestion.`,
                ephemeral : true
            })
        } catch (err) {console.log(err)} // Catch any errors. (Important if their DMs are closed).
    }
}