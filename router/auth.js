const router = require('express').Router();

const {register, login, getMe, forgotPassword,
resetPassword, updateDetails, updatePassword,logout,
changeApproval,activate, resendActivation, updateDP} = require('../controllers/authCtrl')

const {protect,authorize} = require('../middleware/auth')
const imageMiddleware = require('../utils/imageMiddleware')

router.post('/register',register);
router.post('/activate',activate);
router.post('/resend-activation',resendActivation);
router.post('/login',login);
router.get('/me',protect,getMe);
router.get('/logout', protect, logout);
router.patch('/update-details',protect,updateDetails);
router.patch('/update-dp',protect,imageMiddleware ,updateDP);
router.patch('/update-password', protect, updatePassword);
router.post('/forgot-password',forgotPassword);
router.patch('/resetpassword/:resettoken', resetPassword);
router.patch('/approval/:id',protect,authorize('admin'),changeApproval);


module.exports = router;