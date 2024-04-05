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
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(newUser.password, salt);
		newUser.password = hash;
		await newUser.save();
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



// Request password reset (Step 1)
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Handle case where email is not found
            return res.render('forgot-password', { error: 'Email not found' });
        }
        // Generate token
        const token = crypto.randomBytes(20).toString('hex');
        // Set token expiry time (e.g., 1 hour)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        // Send email with reset link
        const transporter = nodemailer.createTransport({
            // Configure your email service here
        });
        const mailOptions = {
            // Configure email options (sender, receiver, subject, etc.)
            // Include the reset password link in the email body
        };
        await transporter.sendMail(mailOptions);
        res.render('forgot-password', { success: 'Check your email for instructions' });
    } catch (error) {
        console.error('Error:', error);
        res.render('forgot-password', { error: 'Something went wrong' });
    }
});

// Reset password (Steps 4 and 5)
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check token expiry
        });
        if (!user) {
            // Handle invalid or expired token
            return res.redirect('/forgot-password');
        }
        res.render('reset-password', { token });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/forgot-password');
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOneAndUpdate({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }, {
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
        if (!user) {
            // Handle invalid or expired token
            return res.redirect('/forgot-password');
        }
        res.render('login', { message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/forgot-password');
    }
});

module.exports = router;


module.exports = router;