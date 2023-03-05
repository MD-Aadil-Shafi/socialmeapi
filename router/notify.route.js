const express = require('express')
const router = express.Router()

const {getNotification, clearNotification} = require('../controllers/notify.ctrl');
const { protect } = require('../middleware/auth');


router.route('/').get(protect, getNotification)
                .delete(protect, clearNotification)

module.exports = router;