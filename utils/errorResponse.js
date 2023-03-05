class ErrorResponse extends Error{
    constructor(message, statusCode){
        super(message);//passing ouer messge
        this.statusCode = statusCode;
    }
}


module.exports = ErrorResponse;