require('dotenv').config()
const sport = process.env.PORT || 4000
const io = require('socket.io')(sport,{
    cors:{
        origin:"*",
    }
})

let users = [];



//check if that userId not present then add
const addUser=(userId,userName, dp, socketId)=>{
    !users.some(user=> user.userId === userId) &&
    users.push({userId,userName, dp, socketId});
}

const removeUser=(socketId)=>{
    users = users.filter(user=> user.socketId !== socketId)
}

const getUser =(userId)=>{
    return users.find(user=> user.userId === userId)
}

io.on("connection", (socket)=>{
    console.log("a user connected.")
    //io.emit()=> for all connected user
    //io.emit("TestEventName","Welcome to Socket Server.")

    //take from client using socket.on
    socket.on("addUser", (userId,userName,dp)=>{
        addUser(userId,userName,dp, socket.id);
        io.emit("getUsers", users);
    })

    //send and get message
    socket.on("sendMessage",({senderId, receiverId, text})=>{
        const user = getUser(receiverId)
        io.to(user?.socketId).emit("getMessage",{
            senderId,
            text
        })
        // console.log('users', users)
        // console.log(senderId, receiverId, text)
    })

    //removing user on disconnecting
    socket.on("disconnect", ()=>{
        console.log('a user disconnected');
        removeUser(socket.id);
    })
})
