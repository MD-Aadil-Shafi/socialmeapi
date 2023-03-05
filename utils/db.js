const mongoose = require('mongoose')

const dbConnect = () =>{
    mongoose.connect(process.env.MONGO_URL)
    .then((data) =>{
        console.log(`MongoDb connected: ${data.connection.host}`)
    }).catch((err)=>{
        console.log('Unable to connect with mongoDB',err )
    })
}

module.exports = dbConnect;

//just calling require qill call this module.