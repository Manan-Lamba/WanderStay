const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../Models/Listing');
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {listingSchema} = require("../schema.js");



// replace app with router
// remove the common prefix

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

// connecting login route
const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        return res.redirect("/login");
    }
    next();
};

// to show all listings -> index route 
router.get("/", wrapAsync(async (req, res) => {
    const listings = await Listing.find();
    // console.log(listings);
    res.render("listings/index", { listings });
}));

// create route -> new post
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});

router.post("/", validateListing, wrapAsync(async (req, res) => {
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
    res.redirect("/");
}));

// show route -> detailed route
router.get("/:id", wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("listings/show", { listing });
}));

// update route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit", { listing });
}));

router.patch("/:id", validateListing, wrapAsync(async (req, res) => {
    let id = req.params.id;
    console.log("Old listing")
    console.log(req.body);
    let url = req.body.image;
    delete req.body.image;
    req.body.image = {
        filename: "listingimage",
        url: url
    };
    let listing = await Listing.findByIdAndUpdate(id, req.body, { new: true });
    console.log("New listing")
    console.log(listing);
    res.redirect(`/${id}`);
}));

// delete listing
router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/");
}));

module.exports = router;