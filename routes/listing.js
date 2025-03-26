const express = require("express");
const router = express.Router();
const wrapAsyn = require("../utils/wrapAsyn.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner ,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listing.js");

const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsyn(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]") , validateListing , wrapAsyn(listingController.createListing))

//New Route

router.get("/new" , isLoggedIn ,listingController.renderNewForm);    

router
    .route("/:id")
    .get(wrapAsyn(listingController.showListing))
    .put(isLoggedIn , isOwner, upload.single("listing[image]") ,validateListing , wrapAsyn(listingController.updateListing))
    .delete(isLoggedIn , isOwner ,wrapAsyn(listingController.destroyListing))

//Edit Route

router.get("/:id/edit" , isLoggedIn , isOwner,wrapAsyn(listingController.renderEditForm));


module.exports = router;