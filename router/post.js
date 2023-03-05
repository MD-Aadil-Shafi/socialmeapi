const router = require('express').Router()
const {createPost, updatePost, deletePost,
getSinglePost, getTimeLinePost, getUserAllPost,
likeUnlikePost, addComment, likeUnlikeComment, deleteComment, reportComment} = require('../controllers/posts')

const {protect} = require('../middleware/auth')
const imageMiddleware = require('../utils/imageMiddleware')

router.post('/',protect,imageMiddleware,createPost)
router.route('/:id').patch(protect, updatePost).delete(protect, deletePost).get(protect, getSinglePost);
router.get('/timeline/:username',protect, getTimeLinePost);
router.get('/all',protect, getUserAllPost);
router.patch('/like/:id',protect,likeUnlikePost);
router.route('/comment/:id').post(protect, addComment)
                            .patch(protect, likeUnlikeComment);
router.delete('/comment/:id/:commentId', protect, deleteComment);
router.patch('/comment/report/:id', protect, reportComment);

module.exports = router