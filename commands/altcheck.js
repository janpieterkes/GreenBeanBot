const { SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder} = require('discord.js')
const axios = require('axios').default
const path = require('path')
const BLSchema = require('../schemas/group.js')
const url = 'https://users.roblox.com/v1/usernames/users'
const profileTemplate = 'https://www.roblox.com/users/USERID/profile'

module.exports = { // The command itself and it's functionality are exported. The bot.js script loops trough all commands and deploys them (it also handles the execution).
    data: new SlashCommandBuilder()
    .setName('altcheck')
    .setDescription('Runs an alt check on the specified user')
    .addStringOption((option) => option.setName('username').setDescription('The username of the person to check').setRequired(true)),

    async execute(interaction) {
        await interaction.reply({content: `Gathering some information. Please give me a minute...`}) // Instantly reply to the interaction. If this does not happen discord will time it out due to the loading time of some HTTP requests.
        
        axios.post(url,{usernames: [interaction.options.getString('username')],excludebannedusers: true}).then(async (response) => { // Search for the given username on roblox using http post requests.

            if (response.data.data.length != 0) { // If a user is found continue with the execution, otherwise let the user know they attemped to search for a non-existent username.

                const userId = response.data.data[0].id // Load a bunch of data, that people deem usefull for alt checks using http requests.
                const followResponse = axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`)
                const friendResponse = axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`)
                const headshotResponse = axios.get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`)
                const badgesResponse = await axios.get(`https://badges.roblox.com/v1/users/${userId}/badges?limit=100&sortOrder=Asc`)
                const groupsResponse = await axios.get(`https://groups.roblox.com/v2/users/${userId}/groups/roles`)

                let blockedGroups = 'None' // This variable represents the text displayed on the results embed later on.
                const blacklistedArray = await BLSchema.find({}).exec() // Load an array of all blacklisted groups using a mongoose schema.

                for (const blockedGroup of blacklistedArray) { // Loop trough the BLgroups array and the user's blacklisted groups. If one of them matches each other it's added to a string of blacklisted groups.
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

                let badgesAmount = badgesResponse.data.data.length.toString() // Roblox uses a page system for the badge API. Instead of implementing it, it's checked wether the max amount of badges on a page is reached if so it's labeled as 100+. As that is sufficient information.
                if (badgesResponse.data.data.length === 100) {
                    badgesAmount = '100+'
                }


                const embed = new EmbedBuilder() // Create the results embed.
                .setColor(0x0099FF)
                //.setDescription(`Alt report on ${response.data.data[0].requestedUsername}`)
                .setTitle(`Alt report on ${response.data.data[0].requestedUsername}`)
                .setURL(profileTemplate.replace('USERID',response.data.data[0].id))
                .addFields( // Add all results to the embed.
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
                row.setComponents(button.data) // Add a button to the results message. This feature is under development.

               interaction.editReply({embeds:[embed],components:[row]}).catch(err=> (console.log(err))) // Update to reply with the new message. 
               interaction.editReply('Found. Enjoy spying!').catch((err)=>{console.log(err)})
            
            } else interaction.editReply({content:'This user does not exist!'})

        }).catch((err) => {
            console.log(err)
            message.edit({content:`An unexpected error occured ${err}`}) // If an error occurs during the search for users, catch it and let the user know.
        })

    }
}