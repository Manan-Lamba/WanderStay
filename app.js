const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const cors = require("cors");
const listingRoutes = require('./routes/listings.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/User.js")
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

// session middleware
app.use(session({
    secret: "mysecretvalue",
    resave: false,
    saveUninitialized: false
}));

// initialise passport for express app middleware
app.use(passport.initialize());

// connect passport with express session
app.use(passport.session());

// configure local strategy
passport.use(new LocalStrategy(User.authenticate()));

// configure serializeUser
passport.serializeUser(User.serializeUser());

// configure deserializeUser
passport.deserializeUser(User.deserializeUser());


// use listings route
// whenever a listing starts with "/listings" go to listingRoutes
app.use("/listings", listingRoutes);


// use reviews routes
// whenever a review starts with "/listings/:id/reviews" go to reviewSchema
app.use("/listings/:id/reviews", reviewRoutes);

// use listings route
// whenever a user starts with "/" go to listingRoutes
app.use("/", userRoutes);

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