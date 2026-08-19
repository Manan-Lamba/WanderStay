const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require('mongoose');
const Review = require('../Models/Review.js');
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schema.js");
const Listing = require('../Models/Listing');
const {isLoggedIn} = require("../middleware.js");


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
    res.send("ACCESS DENIED: User not authorized");
}

// create route -> for reviews
// remove common prefix
router.post("/", isLoggedIn, validateReview, wrapAsync(async(req, res) => {
    let id = req.params.id;
    let review = new Review(req.body);
    review.author = req.user._id;
    console.log(review);

    // reference this review to listing
    let listing = await Listing.findById(id);
    console.log(listing);
    listing.reviews.push(review._id);

    await review.save();
    await listing.save();
    console.log(listing);
    res.redirect(`/listings/${id}`);

}));

// deleting reviews
router.delete("/:reviewId", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let reviewId = req.params.reviewId;
    let listingId = req.params.id;

    //remove reviewId from listing
    let newListing = await Listing.findByIdAndUpdate(listingId, {
        $pull: {reviews: reviewId}
    });

    // delete review document
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${listingId}`);
}));

module.exports = router;