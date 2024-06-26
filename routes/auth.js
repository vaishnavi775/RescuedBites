const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const passport = require("passport");
const middleware = require("../middleware/index.js")
const Donor = require("../models/donor.js");
const NGO = require("../models/ngo.js");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.get("/auth/signup", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/signup", { title: "User Signup" });
});

router.post("/auth/signup", middleware.ensureNotLoggedIn, async (req,res) => {
	
	const { firstName, lastName, email, password1, password2, role } = req.body;
	let errors = [];
	
	if (!firstName || !lastName || !email || !password1 || !password2) {
		errors.push({ msg: "Please fill in all the fields" });
	}
	if (password1 != password2) {
		errors.push({ msg: "Passwords are not matching" });
	}
	if (password1.length < 4) {
		errors.push({ msg: "Password length should be atleast 4 characters" });
	}
	if(errors.length > 0) {
		return res.render("auth/signup", {
			title: "User Signup",
			errors, firstName, lastName, email, password1, password2
		});
	}
	
	try
	{
		const user = await User.findOne({ email: email });
		if(user)
		{
			errors.push({msg: "This Email is already registered. Please try another email."});
			return res.render("auth/signup", {
				title: "User Signup",
				firstName, lastName, errors, email, password1, password2
			});
		}
		
		const newUser = new User({ firstName, lastName, email, password:password1, role });
        const newNGO = new NGO({user: newUser._id});
        const newDonor = new Donor({user: newUser._id});
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(newUser.password, salt);
		newUser.password = hash;
		await newUser.save();
        if (newUser.role == "ngo")
        {
            await newNGO.save();
        }
        else if (newUser.role == "donor")
        {
            await newDonor.save();
        }
		req.flash("success", "You are successfully registered and can log in.");
		res.redirect("/auth/login");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/auth/login", middleware.ensureNotLoggedIn, (req,res) => {
	res.render("auth/login", { title: "User login" });
});

router.post("/auth/login", middleware.ensureNotLoggedIn,
	passport.authenticate('local', {
		failureRedirect: "/auth/login",
		failureFlash: true,
		successFlash: true
	}), (req,res) => {
		res.redirect(req.session.returnTo || `/${req.user.role}/dashboard`);
	}
);

router.get("/auth/logout", (req,res) => {
	req.logout();
	req.flash("success", "Logged-out successfully")
	res.redirect("/");
});


router.get('/auth/forgot-password', (req, res) => {
    res.render('auth/forgot-password');
});

router.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/forgot-password', { error: 'Email not found' });
        }
            
            const token = crypto.randomBytes(20).toString('hex');
            const tokenExpiry = Date.now() + 3600000; 
            
        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();
        
  
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', 
            port: 465, 
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASSWORD 
            }
        });
        

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            html: `<h2>Seems like you have been logged out of your account!</h2> 
            <h3>We have got you covered, kindly proceed with the further instructions to continue donating!</h3><br>
            <hr>
            <h3>Click <a href="http://localhost:5001/auth/reset-password/${token}">here</a> to reset your password</h3>`
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.render('auth/forgot-password', { error: 'Failed to send email. Please try again later.' });
            } else {
                console.log('Email sent:', info.response);
                return res.render('auth/forgot-password', { success: 'Check your email for instructions' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('auth/forgot-password', { error: 'Something went wrong. Please try again later.' });
    }
});

router.get('/auth/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });
        if (!user) {
            return res.render('auth/forgot-password', { error: 'Invalid or expired token' });
        }

        res.render('auth/reset-password', { token, email: user.email });
    } catch (error) {
        console.error('Error:', error);
        res.render('auth/forgot-password', { error: 'Something went wrong. Please try again later.' });
    }
});

router.post('/auth/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log(`vals : ${user.resetPasswordToken} \n ${user.resetPasswordExpires}`)
        if (!user) {
            return res.render('auth/forgot-password', { error: 'Invalid or expired token' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;

        await user.save();

        return res.render('auth/login', { message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('Error:', error);
        return res.render('auth/reset-password', { token, error: 'Something went wrong. Please try again later.' });
    }
});


module.exports = router;