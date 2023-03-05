const User = require('../models/User')
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

//get a user
exports.getSingleUser = asyncHandler(async(req,res,next)=>{
    const userId = req.query.userId;
    const username = req.query.username;

    const user = userId ? await User.findById(userId).select(['name','username','profilePicture'])
                : await User.findOne({username: username}).select(['-activation','-role', '-isAdmin']);;

    res.status(200).json({
        success:true,
        data:user
    })
})

//get all user => advance res for admin
exports.getAllUsers = asyncHandler(async(req,res,next)=>{
    const users = await User.find().sort('-updatedAt')

    res.status(200).json({
        success:true,
        data:users
    })
})
//get all user for adding as friend follow unfollow
exports.getAllUserView = asyncHandler(async(req,res,next)=>{
    const users = await User.find().sort('-updatedAt').select(['name','username','profilePicture','followers','followings'])
    let filtered = users.filter((x)=> x.username !== req.user.username &&  !x?.followers?.some((y)=> y === req.user.username))

    res.status(200).json({
        success:true,
        data:filtered
    })
})

//get friends
exports.getFriends = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user.id)
    // console.log('users',user)
    const friends = await Promise.all(
        user.followings.map((friendName)=>{
            return User.findOne({username: friendName})
        })
    );
    // console.log('frnds', friends)
    let friendList = [];
    friends.map((friend)=>{
        const {_id, username, profilePicture} = friend;
        friendList.push({_id, username, profilePicture})
    });

    res.status(200).json({
        success:true,
        data:friendList
    })
})

//follow unfollow a user

exports.followUnfollow = asyncHandler(async(req, res, next)=>{
    console.log('params', req.params)
    const user = await User.findOne({username:req.params.username})
    if(req.user.username !== req.params.username){
        // const user = await User.findOne({username:req.params.username})
        if(!user.followers.includes(req.user.username)){
            await user.updateOne({$push : {followers : req.user.username}});
            await req.user.updateOne({$push : {followings: req.params.username}});
            res.status(200).json({
                success:true,
                data:{message: 'User followed Successfully'}
            })
        }else{
            await user.updateOne({$pull : {followers : req.user.username}});
            await req.user.updateOne({$pull : {followings: req.params.username}});
            res.status(200).json({
                success:true,
                data:{message: 'User Un-Followed Successfully'}
            })
        }
    }else{
        return next(new ErrorResponse('You can not follow youself',400))
    }
})