const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const crypto = require('crypto')
const sendSgForgotMail = require('../utils/sendResetEmail')
const sendActivationEmail = require('../utils/sendActivationEmail')
const {cldUpload} = require('../utils/cldImageUploader')
const cloudinary = require('cloudinary')

//POST => /api/v1/auth/register
//public
exports.register = asyncHandler(async(req,res,next)=>{
  const {name, username, email, password} = req.body;
  
  if(!name || !username || !email || !password){
    return next(new ErrorResponse("Name, Username, Email and Password is required."))
  }
  if(req.body.role || req.body.isAdmin || req.body.approved){
    return next(new ErrorResponse("Not authorized to set restricted properties."))
  }
  const findByUsername  = await User.findOne({username})
  if(findByUsername) return next(new ErrorResponse("Username already exists"))

  //if found accoutn by email and giviing duplicate error
  //navigate to login page

  let code = generateRandom()

  const user = await User.create({
    name, username, email, password, activation:code
  })

  // res.status(200).json({success:true, token});
  await sendActivationEmail(email, code).then(()=>{
    res.status(200).json({success:true,
    data:{message:'User Registerred Successfully. Please check your email.'}
    })
  })
//   sendTokenResponse(user,200,res)
  
})
//Post => Activation
exports.activate = asyncHandler(async(req, res, next)=>{
    const {token, email} = req.body;
    if(!token || !email){
        return next(new ErrorResponse('Not Authorized',401))
    }
    const user = await User.findOne({email, activation:token})
    if(!user){
        return next(new ErrorResponse('No User Found. Please enter valid code.',400))
    }
    if(user.approved === true){
        return next(new ErrorResponse('Already Activated',400))
    }
    user.approved = true;
    await user.save()
    sendTokenResponse(user,200,res)
    
})
//resend activation code:
exports.resendActivation = asyncHandler(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new ErrorResponse('No user found with this email.',400))
    }
    if(user.approved === true){
        return next(new ErrorResponse('User already activated',400))
    }
        const code = generateRandom();
        user.activation = code;
        await user.save().then(()=>{
            sendActivationEmail(user.email, code).then(()=>{
                res.status(200).json({success:true,
                    data:{message:'Verification code sent successfully. Please check your email.'}
                    })
            })
        })
})
//===========================================
//POST => /api/v1/auth/login
//pulic
exports.login = asyncHandler(async(req, res, next)=>{
    //console.log('req boyd', req.body)
    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorResponse('Please provide an email and password',400))
    }
    //check for user
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorResponse('Invalid credentials',400))
        //401=unauthorized
    }
    //check if password matches
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials',400))
    }
    if(user.approved === false){
        return next(new ErrorResponse('Account not verified. Please check you email for verification process',401))
    }
    // res.status(200).json({success:true, token});
    sendTokenResponse(user,200,res)

});
//===========================================
//POST /api/v1/auth/me
//Private
exports.getMe = asyncHandler(async(req, res, next)=>{
    //since we'll use protect middleware in this route
    //we have access to req.user
    const user = await User.findById(req.user.id).select(['-activation','-role', '-isAdmin']);

    res.status(200).json({
        success:true,
        data:user
    });
});
//=========================================
//GET /api/v1/auth/logout
//Private
//If using cookie
exports.logout = asyncHandler(async(req, res, next)=>{
    //having access to res.cookie since we're using cookie parser
    res.cookie('token','none',{
        //setting token to none
        expires: new Date(Date.now() + 5 * 1000),//5 sec
        httpOnly:true
    })
     
    res.status(200).json({
        success:true,
        data:{}
    });
});
//////////////
exports.updateDetails = asyncHandler(async (req, res, next)=>{
    if(req.body.password){
        return next(new ErrorResponse('Password can only be updated Individually',401))
    }
    if(req.body.role || req.body.isAdmin || req.body.approved){
        return next(new ErrorResponse("Not authorized to set restricted properties."))
    }
    const user = await User.findByIdAndUpdate(req.user.id, req.body,{
        new: true,
        runValidators: true
    });
    res.status(200).json({
        success:true,
        data:user
    })
})
//////////////////
exports.updateDP = async(req, res)=>{
    try{
        const file = req.files.file;
        // console.log('f===>',req.files.file)

        let existingImage = await User.findById(req.user.id)
        if(existingImage.profilePicturePublicId){
            await cloudinary.v2.uploader.destroy(existingImage.profilePicturePublicId)
        }

        let upload = await cldUpload(file)
          
        let updateItem = {
                profilePicture : upload.secure_url,
                profilePicturePublicId: upload.public_id
             }
        // const updateItem = {
        //    profilePic : 'http://localhost:5000/images/' + profilePic
        // }
        const updatedUser = await User.findByIdAndUpdate(req.user.id,
            updateItem,{
                new:true,
            })//.select('-password')

        res.status(201).json({success:true, data: updatedUser})
    }catch(err){
        // console.log('p,err=>',err)
        return res.status(500).json({success:false,message:'Unable to update Profile pic. Please try later...'})
    }
}
///////
exports.updatePassword = asyncHandler(async(req, res, next)=>{
    const user = await User.findById(req.user.id).select('+password')

    if(req.user.email === 'guest.one.sm@yopmail.com' || req.user.email === 'guest.two.sm@yopmail.com'){
        return next(new ErrorResponse("Guests are not allowed set restricted properties."))
      }

    if(!(await user.matchPassword(req.body.currentPassword))){
        return next(new ErrorResponse('Password is incorrect'))
    }
    user.password = req.body.newPassword;
    await user.save()//using userschema pre save at modal level

    sendTokenResponse(user, 200, res);
    res.status(200).json({
        success:true,
        data:user
    })

})
////////////////////////
//approving/disapproving
exports.changeApproval = asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorResponse('No user found.',400))
    }
    user.approved = !user.approved;
    await user.save()

    res.status(200).json({
        success:true,
        data:user
    })
})

/////////////////////
exports.forgotPassword = asyncHandler(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email})

    if(req.body.email === 'guest.one.sm@yopmail.com' || req.body.email === 'guest.two.sm@yopmail.com'){
        return next(new ErrorResponse("Guests are not allowed to set restricted properties. Please create a new account."))
      }

    if(!user){
        return next(new ErrorResponse('No user found with this email id.',404))
    }

    return next(new ErrorResponse("Error Processing Request. Please Try Later."))

    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    try{
        await sendSgForgotMail(user.email, resetUrl)
        res.status(200).json({success:true, data: "Email Sent"})
    }catch(err){
        console.log(err)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next (new ErrorResponse('Email could not me sent', 500))
    }
})
/////////////////
exports.resetPassword = asyncHandler(async(req,res,next)=>{
    const resetPasswordToken = crypto.createHash('sha256')
                                    .update(req.params.resettoken)
                                    .digest('hex');
    const user = await User.findOne({resetPasswordToken,
                    resetPasswordExpire: {$gt: Date.now()}
                })
    if(!user){
        return next(new ErrorResponse('Invalid Token', 400))
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res)
})


//functions
//Get token from model, create for  cookie or local storage and send response
const sendTokenResponse = (user,statusCode,res) =>{
    //this will send token  to store in local
    //by that token will get user profile

    //Create token
    const token = user.getSignedJwtToken();

    const options = {
        //30 DAYS
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        //cookie only accessible to client side
        httpOnly:true
    };

    if(process.env.NODE_ENV === 'production'){
        //create secure property and assign true
        options.secure = true;
        //for https production
    }

    // res.status(statusCode)
    //     .cookie('token',token,options)//key->value->options
    //     .json({
    //         success: true,
    //         token
    //     });
    //for local storage
    res.status(statusCode).json({
            success: true,
            data:token
        });
};


//random number generator:
function generateRandom() {
    var minm = 10000;
    var maxm = 99999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
}
