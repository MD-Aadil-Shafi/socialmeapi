const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
            postId:String,
            userId:String,
            commentId:String,
            reportMessage:String
    
},{timestamps:true})

module.exports = mongoose.model('Reports', ReportSchema)