const User = require("../models/users");
module.exports.renderSingupForm = (req,res)=>
{
    res.render("users/singup.ejs");
};

module.exports.singup = async (req , res) =>
{   
    try{
        let {username , email , password} = req.body;
        const newUser = new User({email , username});
        const registeredUser = await User.register(newUser , password);
        console.log(registeredUser);
        req.login(registeredUser , (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success" , "Welcome To TravellersHub");
            res.redirect("/listing");
        });
    } catch(e){
        req.flash("error" , e.message);
        res.redirect("/singup");
    }
    
};

module.exports.renderLoginForm = (req,res)=>
    {
        res.render("users/login.ejs");
    
};

module.exports.login = async(req , res) =>
    {   
       req.flash("success" , "Welcome to TravellersHub!");
       let redirectUrl = res.locals.redirectUrl || "/listing"
       res.redirect(redirectUrl);
       
    };

module.exports.logout = (req , res , next) => {
    req.logout((err) => {
        if(err){
           return next(err);
        }
        req.flash("success" , "you are logged out!");
        res.redirect("/listing");
    })
};