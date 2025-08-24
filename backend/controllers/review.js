const Review = require("../models/review.js");
const User = require("../models/user");
const Doctor = require("../models/doctor");


const createReview = async (req, res) => {
    try {
        const { rating, comment, doctor, nurse } = req.body;
        const patient = req.user.id;

        if (!doctor && !nurse)
            return res.status(400).json({ error: "Review must be for a doctor or a nurse." });

        if (doctor && nurse)
            return res.status(400).json({ error: "Review cannot be for both a doctor and a nurse." });

        if (!rating || !comment)
            return res.status(400).json({ error: "Rating and comment are required." });

        const existingReview = await Review.findOne({
            patient,
            doctor: doctor || undefined,
            nurse: nurse || undefined
        });

        if (existingReview)
            return res.status(400).json({ error: "You have already reviewed this person." });

        const review = await Review.create({
            rating,
            comment,
            patient,
            doctor: doctor || undefined,
            nurse: nurse || undefined
        });

        res.status(201).json({
            message: "Review created successfully",
            review
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find()
            .skip(skip)
            .limit(limit)
            .populate('patient', 'name');

        res.status(200).json({
            message: "Reviews retrieved successfully",
            reviews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctor: req.params.id }).populate('patient', 'name');
        res.status(200).json({
            message: "Reviews retrieved successfully",
            reviews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const getNurseReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ nurse: req.params.id }).populate('patient', 'name');
        res.status(200).json({
            message: "Reviews retrieved successfully",
            reviews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review)
            return res.status(404).json({ error: "Review not found" });

        if (review.patient.toString() !== req.user.id)
            return res.status(403).json({ error: "Unauthorized to delete this review." });

        await review.deleteOne();
        res.status(200).json({
            message: "Review deleted successfully",
            review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Top rated doctors


const getTopDoctors = async (req, res) => {
  try {
    // 1️⃣ جلب أفضل الدكاترة حسب التقييم
    const topReviews = await Review.aggregate([
      { $match: { doctor: { $ne: null } } },
      { $group: {
          _id: "$doctor",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
      }},
      { $sort: { avgRating: -1 } },
      { $limit: 5 }
    ]);

    // 2️⃣ جلب بيانات الدكاترة وبيانات الـuser
    const topDoctors = await Promise.all(topReviews.map(async r => {
      const doctor = await Doctor.findById(r._id).populate('userId', 'fullName email role');
      if (!doctor) return null;
      return {
        _id: doctor._id,
        avgRating: r.avgRating,
        totalReviews: r.totalReviews,
        specialty: doctor.specialty,
        description: doctor.description,
        price: doctor.price,
        location: doctor.location,
        title: doctor.title,
        user: doctor.userId // الاسم والإيميل والrole
      };
    }));

    // 3️⃣ حذف أي null لو فيه دكاترة مش موجودة
    res.status(200).json(topDoctors.filter(d => d !== null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Top rated nurses
const getTopNurses = async (req, res) => {
  try {
    const topNurses = await Review.aggregate([
      { $match: { nurse: { $ne: null } } },
      { $group: {
          _id: "$nurse",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
      }},
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "nurses",
          localField: "_id",
          foreignField: "_id",
          as: "nurseInfo"
        }
      },
      { $unwind: "$nurseInfo" }
    ]);

    res.status(200).json(topNurses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
    createReview,
    getAllReviews,
    getDoctorReviews,
    getNurseReviews,
    deleteReview,
    getTopDoctors,
    getTopNurses
};
