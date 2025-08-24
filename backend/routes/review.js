const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middlewares/authMiddleware');
const {createReview,getAllReviews,getDoctorReviews,getNurseReviews,deleteReview,getTopDoctors,getTopNurses} = require('../controllers/review.js');

router.post('/', authMiddleware, createReview);
router.get('/',authMiddleware, getAllReviews);
router.get('/doctor/:id',authMiddleware, getDoctorReviews);
router.get('/nurse/:id',authMiddleware, getNurseReviews);
router.delete('/:id', authMiddleware, deleteReview);
router.get("/top-doctors", getTopDoctors);
router.get("/top-nurses", getTopNurses);
module.exports = router;