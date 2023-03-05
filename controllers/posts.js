const asyncHandler = require('../middleware/asyncHandler');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/notification.modal');
const Saved = require('../models/saved.modal');
const Report = require('../models/report.modal')
const ErrorResponse = require('../utils/errorResponse');
const {cldUpload} = require('../utils/cldImageUploader')
const cloudinary = require('cloudinary')

//create a post
exports.createPost = asyncHandler(async(req, res, next)=>{
    // console.log('file',req.files)
    if(req.files !== undefined && req.files?.file){
        let file = req.files.file
        let upload = await cldUpload(file)
        req.body.img=upload.secure_url,
        req.body.imgPublicId=upload.public_id
    }
    req.body.userId = req.user.id
    req.body.username = req.user.username
    req.body.userPic = req.user.profilePicture
    
    const newPost = new Post(req.body);
    const savedPost = await newPost.save()

    res.status(200).json({
        success:true,
        data:savedPost
    })

})

//update post
exports.updatePost = asyncHandler(async(req, res, next)=>{
    const post = await Post.findById(req.params.id);
    if(post.userId.toString() !== req.user.id){
        return next(new ErrorResponse('Unauthorized Post Updation Faild.',403))
    }else{
        await post.updateOne({$set: req.body});
        res.status(200).json({
            success:true,
            message:post
        })
    }
})
//like unlike post
exports.likeUnlikePost = async(req, res, next) =>{

        const post = await Post.findById(req.params.id)
        // console.log('p',post)
        //some will return true / fals as soon as it gets a value 
        if(!post.likes.some((x)=>x.userId === req.user.id)){
            let liker = {
                userId:req.user.id,
                userName:req.user.name,
                userPic:req.user.profilePic,
                likeType:req.body.likeType,
                username:req.user.username,
                postId:post._id,
                creatorId:post.userId,
                notifyFor:'like'
            }
            const {userPic,likeType, ...notifyVals} = liker
            const {postId,postName,creatorId,notifyFor,username, ...postVals} = liker
            // console.log('lkr',liker)
            await post.updateOne({$push: {likes: postVals}})
            // let updated = await Post.findByIdAndUpdate(post._id,{$push: {likes: postVals}},{
            //     new:true
            // })
            if(post?.userId.toString() !== req.user.id) await Notification.create(notifyVals)
            
            res.status(200).json({success:true, message:'Post liked successfully'})
        }else{
            let idx = post.likes.findIndex((x)=>x.userId === req.user.id)
            if(post.likes[idx].likeType === req.body.likeType){
                await post.updateOne({$pull: {likes: {userId: req.user.id} }})
                res.status(200).json({success:true, message:'Post disliked successfully'})
            }else{
                post.likes[idx].likeType = req.body.likeType
                await post.save()
                res.status(200).json({success:true, message:'Post liked successfully'})
            }
            //await post.updateOne({$pull: {likes: req.user.id}})
            // res.status(200).json({success:true, message:'Post disliked successfully'})
        }
        
}
//

//delete post
exports.deletePost = asyncHandler(async(req, res, next)=>{
    const post = await Post.findById(req.params.id);
    // console.log('post user', post?.userId?.toString())
    // console.log('userId', req.user.id)
    if(post.userId?.toString() !== req.user.id){
        return next(new ErrorResponse('Unauthorized. Post Deletion Faild.',403))
    }else{
        if(post.imgPublicId){
            await cloudinary.v2.uploader.destroy(post.imgPublicId)
        }
        await post.deleteOne()
        res.status(200).json({
            success:true,
            data:{message:'Post Deleted Successfully'}
        })
    }
})

//get a post
exports.getSinglePost = asyncHandler(async(req,res,next)=>{
    const post = await Post.findById(req.params.id);
    if(post.userId === req.user.id){
        res.status(200).json({
            success:true,
            data:post
        })
    }else if(req.user.followers.includes(post.userId) && post.privacy !== 'private'){
        res.status(200).json({
            success:true,
            data:post
        })
    }else if(post.privacy === 'public'){
        res.status(200).json({
            success:true,
            data:post
        })
    }else{
        return next(new ErrorResponse('No Post Found',403))
    }
})

//get other's tiemline posts (including their and on their walls)
exports.getTimeLinePost = asyncHandler(async(req,res,next)=>{
    const userPosts = await Post.find({username : req.params.username}).sort('-createdAt')
    //also friends following post
    const friendsPost = await Promise.all(
        req.user.followings.map((friendName)=>{
            return Post.find({
                username: friendName,
                privacy: 'public' || 'friends'
            }).sort('-createdAt')
        })
    );
    res.status(200).json({
        success:true,
        data:userPosts.concat(...friendsPost)
    })
})

//get user's all post
exports.getUserAllPost = asyncHandler(async(req, res, next)=>{
    const posts = await Post.find({userId: req.user.id}).sort('-createdAt')

    res.status(200).json({
        success:true,
        data:posts
    })
})


//
//save unsave post
exports.saveUnsavePost = async(req, res,next) =>{
    // try{
        const post = await Post.findById(req.params.id)
        // console.log('p',post)
        //some will return true / fals as soon as it gets a value 
        if(!post.saved.includes(req.user.id)){
            
            await post.updateOne({$push: {saved: req.user.id}})
            let saveData = {
                postId: post._id,
                desc: post.desc,
                postPic: post.postPic,
                user: req.user.id
            }
            await Saved.create(saveData).then(()=>{
                res.status(200).json({success:true, message:'Post Saved successfully'})
            })
            
        }else{
            await post.updateOne({$pull: {saved: req.user.id }})
            //await post.updateOne({$pull: {likes: req.user.id}})
            await Saved.findOneAndDelete({postId: req.params.id}).then(()=>{
                res.status(200).json({success:true, message:'Post Unsaved successfully'})
            })
            //res.status(200).json({success:true, message:'Post Unsaved successfully'})
        }
        
    // }catch(err){
    //     console.log('err',err)
    //     res.status(500).json({success:false, message:'Unable to like post, please try later.'})
    // }
}

//get saved post
exports.getSavedPost = async(req, res,next)=>{
    // try{
        const data = await Saved.find({user: req.user.id})
        // console.log(data)
        res.status(200).json({success:true, data:data})
    // }catch(err){
    //     console.log('err',err)
    //     res.status(500).json({success:false, message:'Unable to fetch saved posts, please try later.'})
    // }
}

//comments
//add comment
exports.addComment = async(req, res, next)=>{
    // try{
        const post = await Post.findById(req.params.id)
        if(req.user.id !== post.userId && post.privacy === 'private'){
            return next(new ErrorResponse('Not Authorized',403))
        }
        if(!req.body.comment) return next(new ErrorResponse('Cannot add empty comment.',403))
        //commentId:Date.now() + Math.random(), => not using date.now as to sort by time
        let commentor = {
                userId:req.user.id,
                userName:req.user.name,
                userPic:req.user.profilePic,
                commentId:Date.now(),
                comment:req.body.comment,
                username:req.user.username,
                postId:post._id,
                creatorId:post.userId,
                notifyFor:'comment',
                likes:[],
                report:[],
        }

        const {userPic,comment,likes,report, ...notifyVals} = commentor
        const {notifyFor,postId, creatorId,username, ...commentVals} = commentor
        
        post.comments.push(commentVals)
        await post.save()
        
        if(post?.userId !== req.user.id) await Notification.create(notifyVals)

        res.status(200).json({success:true, message:"Commented Successfully"})
    // }catch(err){
    //     console.log('line 50 comment ctrl', err)
    //     res.status(500).json({success:false, message:'Unable to add comment, please try later.'})
    // }
}

//remove comment
exports.deleteComment = async(req, res, next)=>{
    // try{
        // console.log(req.params)
        console.log(req.body)
        const post = await Post.findById(req.params.id)
    //    return console.log(comment)
    //if neither he is commentor or creator
    if(!post.comments.some((x)=>x.userId === req.user.id) && post.userId !== req.user.id){
        return next(new ErrorResponse('Not Authorized',403))
    }

    //updateOne will not return that updated data.
    //check for only update 
    await post.updateOne({$pull: {comments: {commentId: req.params.commentId} }})
        // console.log('uupdated post', post)
        res.status(200).json({success:true, message:'Comment deleted successfully'})
    // }catch(err){
       
    //     return res.status(500).json({success:false, message:'Unable to remove comment, please try later.'})
    // }
}

//Add Likes
exports.likeUnlikeComment = async(req, res, next) =>{
    // try{
        // console.log(req.params, req.body)
        const post = await Post.findById(req.params.id)
        let commentIndex = post.comments.findIndex((x)=> x.commentId === req.body.commentId)
        // if(!post.comments[commentIndex].likes.includes({userId:req.user.id})){
            if(!post.comments[commentIndex].likes.some(x => x.userId === req.user.id)){    
                let liker = {
                userId:req.user.id,
                userName:req.user.name,
                userPic:req.user.profilePic,
                likeType:req.body.likeType,
            }
            post.comments[commentIndex].likes.push(liker)
            // console.log('lkr',liker)
            await post.save()
            res.status(200).json({success:true, message:"Comment Liked Successfully"})
        }else{
            //since we've to assing variable with fileter
           let unLike = post.comments[commentIndex].likes.filter((x)=> x.userId !== req.user.id)
           post.comments[commentIndex].likes = unLike
            await post.save()
            // console.log('after',post)
            res.status(200).json({success:true, message:"Comment Unliked Successfully"})
        }
        
    // }catch(err){
    //     console.log('err',err)
    //     res.status(500).json({success:false, message:'Unable to like comment, please try later.'})
    // }
}

//report
exports.reportComment = async(req, res, next) =>{

        // const post = await Post.findById(req.params.id)
        const report = await Report.findOne({postId:req.params.id, userId:req.user.id, commentId: req.body.commentId})
        if(report){
            return next(new ErrorResponse('You have already reported this post. Our team will look at it.',403))
        }
        //login for saving in post comment array----------------------------------
        // let commentIndex = post.comments.indexOf((x)=> x.commentId === req.body.commentId)
        // if(!post.comments[commentIndex].report.includes({userId:req.user.id})){
        //     let reporter = {
        //         postId:req.params.id,
        //         userId:req.user.id,
        //         commentId:req.body.commentId,
        //         reportMessage:req.body.reportMessage
        //     }
        //     post.comments[commentIndex].report.push(reporter)
        //     // console.log('lkr',liker)
        //     await post.save()
        //     res.status(200).json({success:true, message:"Comment Reported Successfully. We'll look at it."})
        // }-----------------------------------------------------------------------
        let reporter = {
                    postId:req.params.id,
                    userId:req.user.id,
                    commentId:req.body.commentId,
                    reportMessage:req.body.reportMessage
                }
        await Report.create(reporter)
        res.status(200).json({success:true, message:"Comment Reported Successfully. We'll look at it."})

}
