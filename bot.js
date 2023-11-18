require('dotenv').config()

const Discord = require('discord.js')
const fs = require('fs')
const { default: mongoose } = require('mongoose')
const path = require('path')
const REST = new Discord.REST().setToken(process.env.TOKEN)

const gateWayIntents = [Discord.GatewayIntentBits.GuildMessages,Discord.GatewayIntentBits.GuildPresences,Discord.GatewayIntentBits.MessageContent,Discord.GatewayIntentBits.GuildModeration]
const bot = new Discord.Client({intents : gateWayIntents})


bot.on('ready',() => {
    bot.user.setPresence({activities: [{name: 'Roblox users...',type: Discord.ActivityType.Watching}], status:'dnd',})
    console.log(`Logged in as ${bot.user.displayName}#${bot.user.discriminator}`)
})

bot.on(Discord.Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)
        command.execute(interaction)
    } else if (interaction.isButton()) {
        const button = require(path.join(__dirname,'buttons',interaction.customId))
        button.excecute(interaction)
    } else if (interaction.isStringSelectMenu()) {
        try {
            const menu = require(path.join(__dirname,'selectmenus','support',interaction.values[0]))
            // Only executes if menu is found
            menu.executePartOne(interaction)
        } catch {
            interaction.reply({content : 'This feature is under development :tools:!',ephemeral : true})
            return
        }
    } else if (interaction.isModalSubmit()) {
        const modal = require(path.join(__dirname,'selectmenus','support',interaction.customId))
        modal.executePartTwo(interaction)
    } else console.log('neither')
})

const commandsPath = path.join(__dirname,'commands')
const commandFiles = fs.readdirSync(commandsPath)
bot.commands = new Discord.Collection()


for (const file of commandFiles)  {
    const command = require(path.join(commandsPath,file))
    bot.commands.set(command.data.name,command)
}

async function deployCommands() {
    try {
        const serverCommands = []

       bot.commands.forEach(newCommand => {
        //console.log(newCommand)
        serverCommands.push(newCommand.data.toJSON())
       });

        data = await REST
        .put(Discord.Routes
        .applicationCommands(process.env.APPID,996792463190663258),{body:serverCommands})
        
        console.log(`deployed ${data.length} commands`)
    } 
    catch(err){
        console.log(err)
    }
}

mongoose.connect(process.env.MongoURL,{}).catch((err) => (console.log(err)))

bot.login(process.env.TOKEN)
deployCommands()