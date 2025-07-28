const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {createReview,getAllReviews,getDoctorReviews,getNurseReviews,deleteReview} = require('../controllers/review.js');

router.post('/', auth, createReview);
router.get('/',auth, getAllReviews);
router.get('/doctor/:id',auth, getDoctorReviews);
router.get('/nurse/:id',auth, getNurseReviews);
router.delete('/:id', auth, deleteReview);
module.exports = router;