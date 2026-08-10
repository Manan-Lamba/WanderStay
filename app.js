const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./Models/Listing');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync.js");
const cors = require("cors");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require('./Models/Review.js');
const PORT = 8080;

// connecting mongoose with our database
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderstay");
}
main()
    .then((res) => {
        console.log("database connected successfully");
    })
    .catch((err) => {
        console.log(err);
    });


// set ejs as the tempelating engine
app.set("view engine", "ejs");

// telling express to serve static files
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// write all your code
app.use(cors({
    origin: "https://hoppscotch.io"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine("ejs", ejsMate); // Tell Express to use ejs-mate

// validate listing middleware
// route specific
const validateListing = (req, res, next) => {
    let result = listingSchema.validate(req.body);
    if(result.error){
        console.log(result.error.details);
        throw new ExpressError(404, result.error.details[0].message);
    }
    next();
}

// validate review schema middleware
const validateReview = (req, res, next) => {
    let result = reviewSchema.validate(req.body);
    if(result.error){
        throw new ExpressError(404, result.error.details[0].message);
    }
    next();
}

// to show all listings -> index route 
app.get("/listings", wrapAsync(async (req, res) => {
    const listings = await Listing.find();
    // console.log(listings);
    res.render("listings/index", {listings});
}));

// create route -> new post
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    let listing = req.body;
    console.log("--------------");
    console.log(listing);
    let url = req.body.image;
    let newListing = new Listing(listing);
    console.log("--------------");
    console.log(newListing);
    newListing.image = {
        filename: "listingimage",
        url: url
    };
    await newListing.save();
    console.log("--------------");
    console.log(newListing);
    res.redirect("/listings");
}));

// show route -> detailed route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("listings/show", {listing});
}));

// update route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit", {listing});
}));

app.patch("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let id = req.params.id;
    console.log("Old listing")
    console.log(req.body);
    let url = req.body.image;
    delete req.body.image;
    req.body.image = {
        filename: "listingimage",
        url: url
    };
    let listing = await Listing.findByIdAndUpdate(id, req.body, {new: true});
    console.log("New listing")
    console.log(listing);
    res.redirect(`/listings/${id}`);
}));

// delete listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// create route -> for reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
    let id = req.params.id;
    let review = new Review(req.body);
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
app.delete("/listings/:id/reviews/:reviewId", async (req, res) => {
    let reviewId = req.params.reviewId;
    let listingId = req.params.id;

    //remove reviewId from listing
    let newListing = await Listing.findByIdAndUpdate(listingId, {
        $pull: {reviews: reviewId}
    });

    // delete review document
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${listingId}`);
});

// middleware for all types of request
// it is placed at bottom so as to run when no route matches
// since express executes code from top to bottom
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// error handling middleware
app.use((err, req, res, next) => {
    let {status = 500, message = "Something went Wrong"} = err;
    res.status(status).render("listings/error", {message});
});

// at the end start your server
app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
})