const mongoose = require('mongoose')

const ConvSchema = new mongoose.Schema({
members:{
    type:Array,
},

},{timestamps:true})


module.exports = mongoose.model('Conversation', ConvSchema)