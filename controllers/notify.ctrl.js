const Notification = require('../models/notification.modal')
const ErrorResponse = require('../utils/errorResponse');

//get notification
exports.getNotification = async(req, res, next)=>{
    try{
        const notif = await Notification.find({creatorId:req.user.id})
        res.status(200).json({success:true, data: notif})
    }catch(err){
        return next(new ErrorResponse('Unable to get notifications. Please try later.',500))
    }
}

//clear notification
exports.clearNotification = async(req, res, next)=>{
    try{
        await Notification.deleteMany({creatorId:req.user.id})
        res.status(200).json({success:true, message:'Notification cleared successfully'})
    }catch(err){
        return next(new ErrorResponse('Unable to delete notifications. Please try later.',500))
    }
}