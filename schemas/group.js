const {Schema,model} = require('mongoose')

const blackListedGroups = new Schema({
    groupId : Number,
    blacklistedBy : Number,
    timeOfBlackList : String,
    groupName : String
})

module.exports = model('blacklistedGroups',blackListedGroups)