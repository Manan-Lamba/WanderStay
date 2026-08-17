const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../Models/User");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const {signupSchema, loginSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError");

// Adding Server Side validation for signup
const validateSignup = async (req, res, next) => {
    let result = signupSchema.validate(req.body);
    if(result.error){
        console.log(result.error.details);
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

// Adding Server Side validation for signup
const validatelogin = async (req, res, next) => {
    let result = loginSchema.validate(req.body);
    if(result.error){
        console.log(result.error.details);
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

// register a user
router.get("/signup", (req, res) => {
    res.render("users/register");
});

router.post("/signup", validateSignup, wrapAsync(async (req, res, next) => {
        let { username, email, password } = req.body;
        const user = new User({
            email,
            username
        });

        const regUser = await User.register(user, password);
        console.log(regUser);
        req.login(regUser, (err) => {
            if(err){
                return next(err);
            }
            res.send("signup and login successful");
        })
}));

//login a user
router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post(
    "/login",
    validatelogin,
    passport.authenticate("local", {
        failureRedirect: "/login"
    }),
    (req, res) => {
        res.send("login successfully");
    }
);

// logout route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        res.send("logout successful");
    });
});

module.exports = router;