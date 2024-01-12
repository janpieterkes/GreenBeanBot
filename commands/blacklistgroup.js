const {SlashCommandBuilder} = require('discord.js')
const BLGroups = require('../schemas/group')
const axios = require('axios').default

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
            const groupInfo = await axios.get(`https://groups.roblox.com/v1/groups/${option.value}`).catch((err)=>{}) // ATTENTION: THIS WILL NOT LOG AN ERROR!

            if (!groupInfo) {
                interaction.reply({content : `${option.value} is not a valid group ID. Please provide a valid group id`})
                return 
            }

            BLGroups.create({groupId : option.value, blacklistedBy : interaction.user.id,timeOfBlackList : currentTime,groupName : groupInfo.data.name})
            interaction.reply({content: `Successfully blacklisted group with ID: ${option.value}!`})
        }
    }
}