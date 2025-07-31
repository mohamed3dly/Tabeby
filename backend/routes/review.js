const express = require('express');
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware');
const {createReview,getAllReviews,getDoctorReviews,getNurseReviews,deleteReview} = require('../controllers/review.js');

router.post('/', protect, createReview);
router.get('/',protect, getAllReviews);
router.get('/doctor/:id',protect, getDoctorReviews);
router.get('/nurse/:id',protect, getNurseReviews);
router.delete('/:id', protect, deleteReview);
module.exports = router;