const {ButtonBuilder,ButtonStyle} = require('discord.js')
const { excecute } = require('../commands/altcheck')


module.exports = {
    data : new ButtonBuilder()
    .setCustomId('banned_groups')
    .setStyle(ButtonStyle.Danger)
    .setLabel('Test'),

    async excecute(interaction) {
        interaction.reply({content: `This feature is under development :tools:!`})
    }
}