const router = require('express').Router()
const { protect } = require('../middleware/auth')
const {createCoversation, getConversation} = require('../controllers/conversation.ctrl')


router.route('/').post(protect, createCoversation)
                .get(protect, getConversation)


module.exports = router