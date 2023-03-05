const fs = require('fs')

const removeTemp = (path) => {
    fs.unlink(path, err =>{
        if(err) throw err
    })
}

//for filename file
module.exports = async (req, res, next) =>{
    try{//Object having capital O
        if(!req.files || Object.keys(req.files).length === 0){
            // console.log('no file')
            return next()
            //return res.status(400).json({success:false, message:"No file selected"})
        }
        const file = req.files.file;
        // console.log('yes file')
        // console.log(file)
        if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png'){
            removeTemp(file.tempFilePath)
            return res.status(400).json({success:false, message: "Unsupported file format"})
        }
        if(file.size > 1024 * 512){
            //1.24 * 1024 = 1mb
            removeTemp(file.tempFilePath)
            return res.status(400).json({success:false, message: "File size should be less than 512KB"})
        }
        next()
    }catch(err){
        console.log('image middleware',err)
        return res.status(500).json({success:false,message:'Unable to upload pic. Please try later.'})
    }
}