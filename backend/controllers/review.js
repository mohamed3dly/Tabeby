const Review = require("../models/review.js");

const createReview = async (req, res) => {
    try {
        const { rating, comment, doctor, nurse } = req.body;
        const patient = req.user.id;

        if (!doctor && !nurse)
            return res.status(400).json({ error: "Review must be for a doctor or a nurse." });

        if (doctor && nurse)
            return res.status(400).json({ error: "Review cannot be for both a doctor and a nurse." });

        const existingReview = await Review.findOne({
            patient,
            doctor: doctor || null,
            nurse: nurse || null
        });
        if (existingReview)
            return res.status(400).json({ error: "You have already reviewed this person." });

        const review = await Review.create({
            rating,
            comment,
            patient,
            doctor: doctor || null,
            nurse: nurse || null
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('patient', 'name');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctor: req.params.id }).populate('patient', 'name');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getNurseReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ nurse: req.params.id }).populate('patient', 'name');
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ error: "Review not found" });
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {createReview,getAllReviews,getDoctorReviews,getNurseReviews,deleteReview,};