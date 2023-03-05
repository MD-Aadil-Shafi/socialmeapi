const asyncHandler = require('../middleware/asyncHandler')
const Message = require('../models/Message')


exports.addMessage = asyncHandler(async(req, res, next)=>{
    const newMessage = await Message.create(req.body)

    res.status(200).json({success:true, data:newMessage})
})


//get message of a conv
exports.getMessage = asyncHandler(async(req, res, next)=>{
    const messages = await Message.find({
        conversationId:req.params.id
    })

    res.status(200).json({success:true, data:messages})
})

//delte a message
exports.deleteMessage = asyncHandler(async(req, res, next)=>{
    await Message.findByIdAndDelete(req.params.id)
    res.status(200).json({success: true, message:'Deleted Successfully'})
})