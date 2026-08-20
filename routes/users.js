const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require("../Models/User");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { signupSchema, loginSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const userController = require("../controllers/user.js");

// Adding Server Side validation for signup
const validateSignup = async (req, res, next) => {
    let result = signupSchema.validate(req.body);
    if (result.error) {
        console.log(result.error.details);
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

// Adding Server Side validation for signup
const validatelogin = async (req, res, next) => {
    let result = loginSchema.validate(req.body);
    if (result.error) {
        console.log(result.error.details);
        throw new ExpressError(400, result.error.details[0].message);
    }
    next();
};

// register a user
router.get("/signup", userController.signupForm);

router.post("/signup", validateSignup, wrapAsync(userController.createUser));

//login a user
router.get("/login", userController.loginForm);

router.post("/login", validatelogin,
    passport.authenticate("local",
        {
            failureRedirect: "/login",
            failureFlash: true,
            keepSessionInfo: true
        }),
    userController.login);

// logout route
router.get("/logout", userController.logout);

module.exports = router;