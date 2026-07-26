const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./Models/Listing');
const methodOverride = require('method-override');
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
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// to show all listings -> index route 
app.get("/listings", async (req, res) => {
    const listings = await Listing.find();
    console.log(listings);
    res.render("listings/index", {listings});
});

// create route -> new post
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

app.post("/listings", async (req, res) => {
    let listing = req.body;
    let newListing = await Listing.create(listing);
    console.log(newListing);
    res.redirect("/listings");
});

// show route -> detailed route
app.get("/listings/:id", async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/show", {listing});
});

// update route
app.get("/listings/:id/edit", async (req, res) => {
    let id = req.params.id;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit", {listing});
});

app.patch("/listings/:id", async (req, res) => {
    let id = req.params.id;
    console.log("Old listing")
    console.log(req.body);
    let listing = await Listing.findByIdAndUpdate(id, req.body, {new: true});
    console.log("New listing")
    console.log(listing);
    res.redirect(`/listings/${id}`);
});

// delete listing
app.delete("/listings/:id", async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

// at the end start your server
app.listen(PORT, () => {
    console.log(`server is listening on http://localhost:${PORT}`);
})