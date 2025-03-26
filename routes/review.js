const express = require("express");
const router = express.Router({ mergeParams : true});
const wrapAsyn = require("../utils/wrapAsyn.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js")

//Review Route

router.post("/" ,isLoggedIn, validateReview , wrapAsyn(reviewController.createReview));

// Delete Post ROute

router.delete("/:reviewId" , isLoggedIn, isReviewAuthor,wrapAsyn(reviewController.destroyReview));

module.exports = router;