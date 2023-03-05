const express = require('express')
require('dotenv').config()
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const morgan = require('morgan')
// const multer = require('multer')
const cloudinary = require('cloudinary')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const fileUpload = require('express-fileupload')

//custom errorHandler => use below routes
const errorHandler = require('./middleware/error')

//socket connection
require('./socket/index')

//connecting to db 
require('./utils/db')

const app = express()
app.use(cors());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir : '/tmp/',//create a temp folder as well
    // debug: true
    //use temp folder instead of RAM
}))

//cloudinary config
cloudinary.config({
    cloud_name: process.env.CLDNAME,
    api_key: process.env.CLDKEY,
    api_secret: process.env.CLDSECRET,
  });

//static files
app.use("/images",express.static(path.join(__dirname,"public/images")));

//middleware
app.use(express.json())
app.use(mongoSanitize())//noSql injection prevention
app.use(helmet())
app.use(xss())//cross site scripting prevention eg:<script>alert(1)</script>
//limit request amout
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10min
    //max: 1//it'll show too many request. please try later
    //max:1 = 1 limit per 10 min on this api.
    max:100
});
app.use(limiter);

//comment it on deployment
// app.use(morgan("common"))


//routes
const authRouter = require('./router/auth');
const userRouter = require('./router/user');
const postRouter = require('./router/post');
const convRouter = require('./router/conversation');
const messageRouter = require('./router/message');
const notifyRouter = require('./router/notify.route');

//test route
app.get('/',(req,res)=>{
    res.json({message:'Server is running OK'})
})
//calling router
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/post',postRouter);
app.use('/api/v1/conversation',convRouter);
app.use('/api/v1/message',messageRouter);
app.use('/api/v1/notification', notifyRouter);

//put middleware after routes since it works in linear order
app.use(errorHandler);


const port = process.env.PORT || 5000;
const server = app.listen(port,  ()=>{
    console.log('server running on port',port)
})

//Handle unhadled promise rejection //global
process.on('unhandledRejection',(err, promise)=>{
    console.log(`Error: ${err.message}`);
    //close server & exit process
    server.close(()=> process.exit(1));//exit with failure.
});
