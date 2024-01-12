//Rank bot before launching
require('dotenv')
.config()
const importantData = {}
const axios = require('axios').default

async function getxcsrf() {d
    try {

        if (!importantData.xcsrfToken || (Date.now()/1800) - importantData.xcsrfToken.time >= 1700) {
            let xcsrfRes = await axios({
                url : 'https://auth.roblox.com',
                method : 'post',
                headers : {
                    'Content-Type' : 'application/json',
                    "Cookie": ".ROBLOSECURITY=" + process.env.cookie
                }
            })
        } else {
            return importantData.xcsrfToken.token
        }

    } catch (err) {
        const token = err.response.headers.get('x-csrf-token')
        importantData.xcsrfToken = {time : Date.now(),token : token}
        return token
    }
}

async function convertRankId(groupId,rankNumber) {
    try {
        let response = await axios({
            url : `https://groups.roblox.com/v1/groups/${groupId}/roles`,
            method : 'get',
            headers : {
                'Content-Type' : 'application/json'
            }
        })

        for (let groupObject of response.data.roles) {
            if (groupObject.rank === rankNumber) {
                return groupObject.id
            }
        }

    const error = new Error('Rank does not exist in specified group.');
    throw error
    } catch (err) {
        logError(err)
    }
}

async function logRankChange(userId,rankNumber,discordClient) {
    try {
        const logsChannel = await discordClient.channels.fetch('1082497428403535872')
        logsChannel.send(
            {content : `${userId}'s rank was set to ${rankNumber}!`}
        )
    } catch (err) {
        console.log(err)
    }
}

async function logError(error) {
    setTimeout(async () => {
    const logsChannel = await bot.channels.fetch('1082497428403535872')
    logsChannel.send(
        {content : `${error.toString()}`}
    )
    },1500)
}

module.exports = {
    async setRank(groupId,rankNumber,userId,discordClient) {
        try {
            let xtoken = await getxcsrf()
            let roleId = await convertRankId(groupId,rankNumber)
            await axios({
                url : `https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`,
                method : 'patch',
                data : {roleId : `${roleId}`},
                headers : {
                    'X-CSRF-TOKEN' : `${xtoken}`,
                    "Cookie": '.ROBLOSECURITY=' + process.env.cookie
                }
            })
    
            if (discordClient) {
                logRankChange(userId,rankNumber,discordClient)
            }
    
        } catch (err) {
            if (err.response.data.errors[0].message) {
                console.log(err.response.data.errors[0].message)
            } else {console.log(err)}
        }
    },

    async promotePlayer(groupId,userId) {
        try {
            let xtoken = await getxcsrf()
            let userRes = await axios({
                url : `https://groups.roblox.com/v2/users/${userId}/groups/roles`,
                method : 'get'
            })

            let userRanks = userRes.data.data
            let currentRank
            for (const groupObject of userRanks) {
                if (groupObject.group.id === groupId) {
                    currentRank = groupObject.role.rank
                    break
                }
            }

            if (!currentRank || currentRank === 0) {
                throw new Error(`User is not in group ${groupId}`)
            } else {console.log(currentRank)}

            let groupRes = await axios({
                url : `https://groups.roblox.com/v1/groups/${groupId}/roles`,
                method : 'get'
            })

            let rolesArray = groupRes.data.roles
            let rankIndex = rolesArray.findIndex((role) => role.rank === currentRank)
            rankIndex += 1

            if (!rolesArray[rankIndex] || rankIndex >= 255) {
                throw new Error('User reached max rank')
            } else {console.log(rolesArray[rankIndex])}

            await this.setRank(groupId,rolesArray[rankIndex].rank,userId)
            
        } catch (err) {console.log(err)}
    }
}