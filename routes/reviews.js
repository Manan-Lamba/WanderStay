const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require('mongoose');
const Review = require('../Models/Review.js');
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schema.js");
const Listing = require('../Models/Listing');
const {isLoggedIn} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


// validate review schema middleware
const validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(404, result.error.details[0].message);
    }
    next();
}

// authorization middleware for reviews
const isOwner = async (req, res, next) => {
    let reviewId = req.params.reviewId;
    let review = await Review.findById(reviewId);
    if(!review){
        return next(new ExpressError(404, "Page Not Found"));
    }
    if(req.user._id.equals(review.author)){
        return next();
    }
    req.flash("error", "You are not authorized to perform this action.");
    return res.redirect(`/listings/${req.params.id}`);
}

// create route -> for reviews
// remove common prefix
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// deleting reviews
router.delete("/:reviewId", isLoggedIn, isOwner, wrapAsync(reviewController.deleteReview));

module.exports = router;