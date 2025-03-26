if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main()
{
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store =MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error" , ()=> {
    console.log("ERROR in Mongo Session Store" , err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true ,
    }
};  



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser =  req.user;
    next();
});

app.use("/listing" , listings);
app.use("/listing/:id/reviews" , reviews);
app.use("/" , user);

app.all("*" ,(req,res,next)=>
{
    next(new ExpressError(404,"Page Not Found"));
});


app.use((err,req,res,next) => {
    let{ statusCode=500 ,message="Something Went Wrong"} = err;
    res.status(statusCode).render("error" , {message});
});

app.listen(8080 , () =>
{
    console.log("App is Listening");
});


// FULL CODE


// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// // const Listing = require("./models/listing.js");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// // const wrapAsyn = require("./utils/wrapAsyn.js");
// const ExpressError = require("./utils/ExpressError.js");
// // const {listingSchema , reviewSchema} =require("./schema.js");
// // const Review = require("./models/review.js");

// const listings = require("./routes/listing.js");
// const reviews = require("./routes/review.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/travellershub";

// main().then(() => {
//     console.log("Connected to DB");
// }).catch((err) => {
//     console.log(err);
// });

// async function main()
// {
//     await mongoose.connect(MONGO_URL);
// }

// app.set("view engine" , "ejs");
// app.set("views" , path.join(__dirname , "views"));
// app.use(express.urlencoded({extended : true}));
// app.use(methodOverride("_method"));
// app.engine("ejs" , ejsMate);
// app.use(express.static(path.join(__dirname , "/public")));

// app.get("/" , (req , res) =>
// {
//     res.send("Hi , this is root directary.")
// });

// // const validateListing =(req,res,next)=>{
// //     let {error} = reviewSchema.validate(req.body);
// //     if(error){
// //         let errMsg = error.details.map((el) => el.message).join(",");
// //         throw new ExpressError(400,errMsg);
// //     }else{
// //         next();
// //     }
// // };

// // const validateReview =(req,res,next)=>{
// //     let {error} = listingSchema.validate(req.body);
// //     if(error){
// //         let errMsg = error.details.map((el) => el.message).join(",");
// //         throw new ExpressError(400,errMsg);
// //     }else{
// //         next();
// //     }
// // };

// // //Index Route

// // // app.get("/listing" , wrapAsyn(async (req , res) =>
// // // {
// // //     const allListings = await Listing.find({});
// // //     res.render("listings/index.ejs" , {allListings});
    
// // // }));

// // app.get("/listing" , async (req , res) =>
// //     {
// //         const allListings = await Listing.find({});
// //         res.render("listings/index.ejs" , {allListings});
        
// //     });

// // //New Route

// // app.get("/listing/new" , (req , res) =>
// //     {
// //         res.render("listings/new.ejs");
// //     });

// // //Show Route

// // // app.get("/listing/:id" , wrapAsyn( async(req , res) =>
// // // {
// // //     let {id} = req.params;
// // //     const listing = await Listing.findById(id);
// // //     res.render("listings/show.ejs" , {listing});
// // // }));

// // app.get("/listing/:id" , async(req , res) =>
// //     {
// //         let {id} = req.params;
// //         const listing = await Listing.findById(id).populate("reviews");
// //         res.render("listings/show.ejs" , {listing});
// //     });

// // //Create Route

// // // app.post("/listing" ,validateListing , wrapAsyn(async(req , res ,next) =>
// // //     {
// // //         const newListing = new Listing(req.body.listing);
// // //         await newListing.save();
// // //         res.redirect("/listing");
// // //     })
// // // );

// // app.post("/listing" , async (req , res ) =>
// //     {
// //         const newListing = new Listing(req.body.listing);
// //         await newListing.save();
// //         res.redirect(`/listing`);
// //     });

// // //Edit Route

// // app.get("/listing/:id/edit" ,async (req , res) =>
// // {
// //     let {id} = req.params;
// //     const listing = await Listing.findById(id);
// //     res.render("listings/edit.ejs" , {listing});
// // });

// // //Update Route

// // app.put("/listing/:id" , validateListing , wrapAsyn( async(req , res) =>
// //     {
// //         let {id} = req.params;
// //         await Listing.findByIdAndUpdate(id , {...req.body.listing});
// //         res.redirect(`/listing/${id}`);
// //     }));

// // // app.put("/listing/:id" ,  async(req , res) =>
// // //     {
// // //         let {id} = req.params;
// // //         await Listing.findByIdAndUpdate(id , {...req.body.listing});
// // //         res.redirect(`/listing/${id}`);
// // //     });

// // //Delete Route

// // app.delete("/listing/:id" ,async(req,res)=>
// // {
// //     let {id} = req.params;
// //     let deletedListing = await Listing.findByIdAndDelete(id);
// //     console.log(deletedListing);
// //     res.redirect("/listing");
// // });

// app.use("/listing" , listings);
// app.use("/listing/:id/reviews" , reviews);

// // //Review Route
// // //Post route

// // app.post("/listing/:id/reviews" , validateReview , wrapAsyn(async (req , res) => 
// //     {
// //         let listing = await Listing.findById(req.params.id);
// //         let newReview = new Review(req.body.review);

// //         listing.reviews.push(newReview);

// //         await newReview.save();
// //         await listing.save();

// //         // console.log("Thank you for sharing your Experience");
// //         // res.send("Thank you")

// //         res.redirect(`/listing/${listing._id}`);
// //     })
// // );


// // // Delete Post ROute

// // app.delete("/listing/:id/reviews/:reviewId" , 
// //     wrapAsyn(async (req,res) => 
// //     {
// //         let{id , reviewId} = req.params;

// //         await Listing.findByIdAndUpdate(id , {$pull : {reviews: reviewId}});
// //         await Review.findByIdAndDelete(reviewId);

// //         res.redirect(`/listing/${id}`);
// //     })
// // );


// app.all("*" ,(req,res,next)=>
// {
//     next(new ExpressError(404,"Page Not Found"));
// });


// app.use((err,req,res,next) => {
//     let{ statusCode=500 ,message="Something Went Wrong"} = err;
//     res.status(statusCode).render("error" , {message});
//     // res.status(statusCode).send(message);
// });

// app.listen(8080 , () =>
// {
//     console.log("App is Listening");
// });