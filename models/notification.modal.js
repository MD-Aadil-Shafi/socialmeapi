const mongoose = require('mongoose')

const NotifySchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    userName:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
    },
    postId:{
        type:String,
        required:true,
    },
    creatorId:{
        type:String,
        required:true,
    },
    notifyFor:{
        type:String,
        enum:['like','reply','comment'],
        required:true
    }
},{timestamps:true})


module.exports = mongoose.model('notification',NotifySchema)