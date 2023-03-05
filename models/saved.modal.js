const mongoose = require('mongoose')

const savedSchema = new mongoose.Schema({
    postId:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    postPic:String,
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'users'
    }
})

module.exports = mongoose.model('saved',savedSchema)