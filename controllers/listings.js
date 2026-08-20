const Listing = require("../Models/Listing");

const index = async (req, res) => {
    const listings = await Listing.find();
    // console.log(listings);
    res.render("listings/index", { listings });
};

const newListingForm = (req, res) => {
    res.render("listings/new");
};

const createListing = async (req, res) => {
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
    newListing.owner = req.user._id;
    await newListing.save();
    console.log("--------------");
    console.log(newListing);
    req.flash("success", "🎉 Congratulations! Listing created successfully!");
    res.redirect("/listings");
};

const showListing = async (req, res) => {
    let id = req.params.id;
    
    const listing = await Listing.findById(id).populate({
    path: "reviews",       // populate reviews
    populate: {
        path: "author"     // then populate author inside each review
    }
}).populate("owner");

    console.log(listing);
    res.render("listings/show", { listing });
};

const updateListingForm = async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit", { listing });
};

const updateListing = async (req, res) => {
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
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

const deleteListing = async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listings");
};

module.exports = {
    index,
    newListingForm,
    createListing,
    showListing,
    updateListingForm,
    updateListing,
    deleteListing
}