const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../Models/Listing');
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError");
const {listingSchema} = require("../schema.js");
const {isLoggedIn} = require("../middleware.js");
const listingController = require("../controllers/listings.js");


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



// Authorization middleware for listings
const isOwner = async (req, res, next) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if(!listing){
        return next(new ExpressError(404, "Listing Not Found"));
    }
    if(listing.owner.equals(req.user._id)){
        return next();
    }
   req.flash("error", "You are not authorized to perform this action.");
   return res.redirect(`/listings/${id}`);
};

// to show all listings -> index route 
router.get("/", wrapAsync(listingController.index));

// create route -> new post
router.get("/new", isLoggedIn, listingController.newListingForm);

router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// show route -> detailed route
router.get("/:id", wrapAsync(listingController.showListing));

// update route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.updateListingForm));

router.patch("/:id", validateListing, isOwner, wrapAsync(listingController.updateListing));

// delete listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;