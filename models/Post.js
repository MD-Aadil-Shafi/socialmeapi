const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type:mongoose.Schema.ObjectId,
      ref:'User',
      required:true,
    },
    username:{
      type:String,
      required:true
    },
    desc: {
      type: String,
      max: 500,
    },
    userPic:String,
    img: {
      type: String,
    },
    imgPublicId:String,
    likes: [
      {
        userId:String,
        userName:String,
        userPic:String,
        likeType:{
            type:String,
            enum:['thumbsup','laugh','love','lit'],
            default:'thumbsup'
        }
    }
    ],
    comments:[
      {
          userId:String,
          userName:String,
          userPic:String,
          commentId:String,
          comment:String,
          likes:[
              {
              userId:String,
              userName:String,
              userPic:String,
              likeType:{
                  type:String,
                  enum:['thumbsup','laugh','love','lit']
              }
          }
          ],
          report:[
              {
                  userId:String,
                  userName:String,
                  reportMessage:String
              }
          ]
          
      }
  ],
    privacy:{
      type:String,
    enum:['public','private','friends'],
    default:'public'  
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);