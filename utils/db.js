const mongoose = require('mongoose')

const dbConnect = mongoose.connect(
    process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    },(error) =>{
        if(!error){
            console.log("connected to the MongoDB");
        }else {
            console.log(error)
            console.log("Failed to connect to MongoDB")
        }
    }
);

module.exports = dbConnect;

//just calling require qill call this module.