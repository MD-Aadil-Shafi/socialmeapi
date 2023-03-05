const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next)=>{
    //get all property of err in error
    let error = {...err}
    error.message = err.message
    console.log(err.stack);//stack'll provide file info etc
    console.log(err.name);//like CastError

    //Mongoose bad ObjectId
    if(err.name === 'CastError'){
        const message = `Resource not found.`;// with id of ${err.value}
        error = new ErrorResponse(message, 404)
    }

    //Mongoose duplicate key
    if(err.code === 11000){
        const message = 'Duplicate field value found';
        error = new ErrorResponse(message, 400);
    }

    //Mongoose validation error
    if(err.name === 'ValidationError'){//like please add address, please add description...
        //will work for required fields
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success:false, error: error.message || 'Server Error'});
    //we need to run it by app.use since its a middleware
}

module.exports = errorHandler;