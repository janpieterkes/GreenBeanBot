const {SlashCommandBuilder} = require('discord.js')
const config = require('../config.json')
const BLGroups = require('../schemas/group')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('blacklist_group')
    .setDescription('Adds a group to the alt detection')
    .addNumberOption((option)=>(option.setName('group_id').setDescription('The Id of the group').setRequired(true))),

    async execute(interaction) {
        const option = interaction.options.get('group_id')
        const check = await BLGroups.findOne({groupId : option.value}).exec()
        if (check) {
            interaction.reply({content: `The group with ID ${option.value} is already blacklisted! :black_medium_square:`})
        } else {
            const currentTime = new Date().toUTCString(Date.now())
            BLGroups.create({groupId : option.value, blacklistedBy : interaction.user.id,timeOfBlackList : currentTime})
            interaction.reply({content: `Successfully blacklisted group with ID: ${option.value}!`})
        }
    }
}