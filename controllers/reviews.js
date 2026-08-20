const Listing = require("../Models/Listing");
const Review = require("../Models/Review");

const createReview = async(req, res) => {
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
    req.flash("success", "Review created successfully!");
    res.redirect(`/listings/${id}`);

};

const deleteReview = async (req, res) => {
    let reviewId = req.params.reviewId;
    let listingId = req.params.id;

    //remove reviewId from listing
    let newListing = await Listing.findByIdAndUpdate(listingId, {
        $pull: {reviews: reviewId}
    });

    // delete review document
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${listingId}`);
};


module.exports = {
    createReview,
    deleteReview
}