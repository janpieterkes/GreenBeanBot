const {SlashCommandBuilder,EmbedBuilder} = require('discord.js')
const BLSchema = require('../schemas/group')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('whitelist_group')
    .setDescription('Removes a group from the alt detection')
    .addNumberOption((option)=>(option.setName('group_id').setDescription('The Id of the group').setRequired(true))),

    async execute(interaction) {
        const groupId = interaction.options.get('group_id').value
        const groupObject = await BLSchema.find({groupId : groupId}).exec()
        if (groupObject) {
            await BLSchema.deleteOne({groupId : groupId}).exec()
            interaction.reply({content : `Successfully removed group with ID: ${groupId} from the blacklist!`})
        } else interaction.reply({content : `The group with ID: ${groupId} is not currently blacklisted!`})
    }
}