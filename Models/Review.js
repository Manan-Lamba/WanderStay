const mongoose = require("mongoose");

// define schema
const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// define reviews model
const Review = mongoose.model('Review', reviewSchema);

// export only the model
module.exports = Review;