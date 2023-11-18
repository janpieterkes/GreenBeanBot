const { SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder} = require('discord.js')
const axios = require('axios').default
const path = require('path')
const BLSchema = require('../schemas/group.js')
const url = 'https://users.roblox.com/v1/usernames/users'
const profileTemplate = 'https://www.roblox.com/users/USERID/profile'

module.exports = {
    data: new SlashCommandBuilder()
    .setName('altcheck')
    .setDescription('Runs an alt check on the specified user')
    .addStringOption((option) => option.setName('username').setDescription('The username of the person to check').setRequired(true)),

    async execute(interaction) {
        await interaction.reply({content: `Gathering some information. Please give me a minute...`})
        
        axios.post(url,{usernames: [interaction.options.getString('username')],excludebannedusers: true}).then(async (response) => {

            if (response.data.data.length != 0) {

                const userId = response.data.data[0].id
                const followResponse = axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`)
                const friendResponse = axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`)
                const headshotResponse = axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`)
                const badgesResponse = await axios.get(`https://badges.roblox.com/v1/users/${userId}/badges?limit=100&sortOrder=Asc`)
                const groupsResponse = await axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`)

                let blockedGroups = 'None'
                const blacklistedArray = await BLSchema.find({}).exec()

                for (const blockedGroup of blacklistedArray) {
                    for (const Object of groupsResponse.data.data) {
                     if (blockedGroup.groupId === Object.group.id) {
                         if (blockedGroups === 'None') {
                            blockedGroups = `${Object.group.name}`
                         } else blockedGroups += `\n ${Object.group.name}`
                          break
                       }
                    }
                    //if (blockedGroups) break
                }

                let badgesAmount = badgesResponse.data.data.length.toString()
                if (badgesResponse.data.data.length === 100) {
                    badgesAmount = '100+'
                }


                const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                //.setDescription(`Alt report on ${response.data.data[0].requestedUsername}`)
                .setTitle(`Alt report on ${response.data.data[0].requestedUsername}`)
                .setURL(profileTemplate.replace('USERID',response.data.data[0].id))
                .addFields(
                    {name: 'Followers', value: (await followResponse).data.count.toString()},
                    {name: 'Friends', value: (await friendResponse).data.count.toString()},
                    {name: 'Owned Badges', value: badgesAmount},
                    {name: 'Banned Groups', value: blockedGroups}
                )
                .setThumbnail((await headshotResponse).data.data[0].imageUrl);

                const button = require('../buttons/banned_groups.js')
                
                if (blockedGroups === 'None') {
                    button.data.setDisabled(true)
                } else button.data.setDisabled(false)

                const row = new ActionRowBuilder()
                row.setComponents(button.data)

               interaction.editReply({embeds:[embed],components:[row]}).catch(err=> (console.log(err)))
               interaction.editReply('Found. Enjoy spying!').catch((err)=>{console.log(err)})
            
            } else interaction.editReply({content:'This user does not exist!'})

        }).catch((err) => {
            console.log(err)
            message.edit({content:`An unexpected error occured ${err}`})
        })

    }
}