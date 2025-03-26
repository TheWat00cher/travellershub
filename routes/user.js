const express = require("express");
const router = express.Router();
const User = require("../models/users");
const wrapAsyn = require("../utils/wrapAsyn");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")

router
    .route("/singup")
    .get(userController.renderSingupForm)
    .post(wrapAsyn(userController.singup))
    
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl , passport.authenticate("local" , {failureRedirect: '/login' , failureFlash: true}) ,userController.login)

router.get("/logout" , userController.logout);

module.exports = router ;