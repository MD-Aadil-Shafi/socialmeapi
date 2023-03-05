const router = require('express').Router()
const {getSingleUser, getAllUsers, getFriends, followUnfollow, getAllUserView} = require('../controllers/userCtrl')

const {protect,authorize} = require('../middleware/auth')

router.get('/',protect,authorize('admin'),getAllUsers);
router.get('/add/view',protect,getAllUserView);
router.get('/info',getSingleUser);
router.get('/friends',protect,getFriends);
router.patch('/:username/follow',protect, followUnfollow);

module.exports = router;