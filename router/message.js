const router = require('express').Router()
const {addMessage, getMessage, deleteMessage} = require('../controllers/message.ctrl');
const { protect } = require('../middleware/auth');

router.post('/',protect, addMessage);
router.route('/:id').get(protect, getMessage)
                    .delete(protect, deleteMessage)

module.exports = router;