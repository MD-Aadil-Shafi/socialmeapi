const asyncHandler = require('../middleware/asyncHandler')
const Conversation = require('../models/Conversation')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

//create new conv
exports.createCoversation = asyncHandler(async(req, res, next)=>{

    const prevConv = await Conversation.find({
        members: {$all:[req.body.senderId, req.body.receiverId]},
    })
    //63f8c7ff5c1f95be2ec49351', '63f32a025aca53f52fc0c82b
    //'63f8c7ff5c1f95be2ec49351', '63ecbfe5fae4974be6b30618'

    // console.log('prevConv',prevConv)
    if(!prevConv?.length){
        const newConv = new Conversation({
            members:[req.body.senderId, req.body.receiverId],
        })
        // console.log(req.body)
    
        const savedConv = await newConv.save()
        res.status(200).json({success:true, data:savedConv})
    }else{
        return next(new ErrorResponse('Chat session already created',400))
    }

    
    

})


//get conv

exports.getConversation = asyncHandler(async(req, res, next)=>{
    const conv = await Conversation.find({
        members: {$in:[req.user.id]},
    })
    let data = []
    conv?.map((item)=>{
        data.push(item?.members)
    })
    let newData = [...data]
    newData = newData.flat()
    // console.log('nd', newData)
    let newSet = new Set(newData)
    // console.log('ns',newSet)
    //to convert set to array
    let frndsArr =  Array.from(newSet)?.filter((x)=> x !== req.user.id)
    // let idSet = new Set(data.map(item => item.name));
    // console.log('frndArr',frndsArr)
    // console.log('conv',conv)
    const convDetail = await Promise.all(
        frndsArr?.map((item)=>{
                // console.log('inn',inn);
                return User.findById(item).select(['name','username','profilePicture']) 
        })
    );
    // console.log('convDetail',convDetail)
    // console.log('conv',conv)

    let sampleArr = []
    let newD = conv?.map((x)=>{
        convDetail?.map((y)=>{
            if(x?.members?.includes(y?._id)){
                sampleArr.push({conv:x, detail:y})
            }
        })
    })

    // console.log('sampleArr', sampleArr)

    // let newConvData = [...conv, ...convDetail]
    // console.log('newConv Data', newConvData)

    res.status(200).json({success:true, data:sampleArr})
})


//get conv of two user
exports.getConversationOfTwo = asyncHandler(async(req, res, next)=>{
    const conv = await Conversation.findOne({
        members: {$all:[req.user.id, req.params.frndId]},
    })

    

    res.status(200).json({success:true, data:conv})
})