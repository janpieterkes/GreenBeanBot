const {Schema,model} = require('mongoose')

const blackListedGroups = new Schema({
    groupId : Number,
    blacklistedBy : Number,
    timeOfBlackList : String
})

module.exports = model('blacklistedGroups',blackListedGroups)