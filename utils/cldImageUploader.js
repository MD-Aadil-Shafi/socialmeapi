const cloudinary = require("cloudinary");
const fs = require('fs')


const removeTemp = (path) =>{
    fs.unlink(path, err =>{
        if(err) throw err
    })
}

exports.cldUpload = async(file)=>{
    // console.log('cld in file', file)
    try{
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
    folder:'socialMe'
    })
    removeTemp(file.tempFilePath)
    return result
    }catch(err){
        console.log('cld in err', err)
return false
    }
}

// const imageId = user.avatar.public_id;

//     await cloudinary.v2.uploader.destroy(imageId);