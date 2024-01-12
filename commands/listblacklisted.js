const {SlashCommandBuilder,EmbedBuilder} = require('discord.js')
const BLGroups = require('../schemas/group')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('show_blacklist')
    .setDescription('Shows a list of all blacklisted groups'),

    async execute(interaction) {
        const groupArray = await BLGroups.find({}).exec()
        let groupString = 'None'

        groupArray.forEach((group)=>{
            if (groupString === 'None') {
                groupString = `**Group**: ${group.groupName} **Group ID**: ${group.groupId} **Blacklisted by**: <@${group.blacklistedBy}>`
            } else groupString += `\n**Group**: ${group.groupName} **Group ID**: ${group.groupId} **Blacklisted by**: <@${group.blacklistedBy}>`
        })

        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Blacklisted groups')
        .addFields(
            {name : 'Groups',value : groupString}
        )

        interaction.reply({content : '',embeds: [embed]})
    }
}