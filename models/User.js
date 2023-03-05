const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//crypto to generate hash for password reset token
const crypto = require('crypto')

const UserSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            require:[true, "Please add a name"]
        },
        username:{
            type:String,
            minLength: 3,
            maxLength: 20,
            require:[true, "Username is required"],
            unique: true,
            //Nubmer => min, Stirng => minLength
        },
        approved:{
            type:Boolean,
            default:false,
        },
        email:{
            type:String,
            require:[true, 'Please add an email'],
            unique:true,
            match:[
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ],
        },
        password:{
            type:String,
            minLength:6,
            require:[true, "Please add a password"],
            //not show password in get request
            select: false,
        },
        profilePicture:{
            type:String,
            default:"",
        },
        profilePicturePublicId:String,
        coverPicture:{
            type:String,
            default:"",
        },
        followers:{
            type:Array,
            default:[],
        },
        followings:{
            type:Array,
            default:[],
        },
        isAdmin:{
            type:Boolean,
            default:false,
        },
        role:{
            type:String,
            enum:['user','admin','super'],
            default:'user',
        },
        desc:{
            type:String,
            maxLength:120,
        },
        country:{
            type:String,
            maxLength:20,
        },
        state:{
            type:String,
            max:20,
        },
        city:{
            type:String,
            maxLength:20,
        },
        from:{
            type:String,
            maxLength:50,
        },
        relationship:{
            type:String,
            enum:['single','married',"don't want to say"]
        },
        mobile:{
            type:String,
            maxLength:13,
        },
        dob:String,
        privacy:{
            type:String,
          enum:['public','private','friends'],
          default:'public'  
        },
        activation:Number,
        resetPasswordToken:String,
        resetPasswordExpire: Date,
    },{timestamps: true});

//encrypt password before save
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
//method than can be called on this modal if used in some other files
UserSchema.methods.getSignedJwtToken = function(){
    //payload = user id
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

//match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function(enteredPass){
    return await bcrypt.compare(enteredPass, this.password);
};

//Generate and hash password to token
//no async
UserSchema.methods.getResetPasswordToken = function(){
    //generate token
    //convert to string since it'll give buffer value
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hahs token and set to resetPasswordToken filed in db
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //10 min

    return resetToken;

}


module.exports = mongoose.model("User",UserSchema);