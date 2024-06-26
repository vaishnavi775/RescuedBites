const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Food = require("../models/food.js");
const Donor = require("../models/donor.js");
const Notification = require('../models/notification');
const NotificationService = require('../config/notificationService');
const nodemailer = require('nodemailer');

router.get('/donor/notification', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id }).sort({ timestamp: -1 });
        await Notification.updateMany({ recipient: req.user._id }, { $set: { status: 'read' } });

		res.render("donor/notification", { title: "Notifications", notifications: notifications });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});	

router.get("/donor/dashboard", middleware.ensureDonorLoggedIn, async (req,res) => {
	const donorId = req.user._id;
	const numPendingDonations = await Food.countDocuments({ donor: donorId, status: "pending" });
	const numAcceptedDonations = await Food.countDocuments({ donor: donorId, status: "collected" });
	const numCollectedDonations = numPendingDonations + numAcceptedDonations;
	const notifications = await Notification.find({ recipient: req.user._id,status: 'unread' });
	res.render("donor/dashboard", {
		title: "Dashboard",
		numPendingDonations, numAcceptedDonations,numCollectedDonations,notifications: notifications ,
	});
});


router.get("/donor/donate", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();

        res.render("donor/donate", { title: "Donate", notifications: notifications });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }

});



router.post("/donor/donate", middleware.ensureDonorLoggedIn, async (req, res) => {

    try {
 
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
            to: '',
            subject: 'New Donation Request',
            html: `<h2>New Donation Request</h2> 
            <h3>Hello NGOs,</h3>
            <p>A new donation request has been made. Please login to your account to review the details.</p>
            <p>Thank you for your support!</p>`
        };
    
        const ngos = await User.find({ role: "ngo" });
      
        ngos.forEach(ngo => {
            mailOptions.to += ngo.email + ',';
        });

        mailOptions.to = mailOptions.to.slice(0, -1);
    
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.render('auth/forgot-password', { error: 'Failed to send email. Please try again later.' });
            } else {
                console.log('Email sent:', info.response);
                
                const donation = req.body.donation;
                donation.status = "pending";
                donation.donor = req.user._id;
                console.log(donation);
                const newDonation = new Food(donation);
                await newDonation.save();
                await Donor.findOneAndUpdate({ user: req.user._id}, {$push:{ donatedFood: newDonation }}, { upsert: true });
                
                const senderId = req.user._id;
                const senderfName = req.user.firstName;
                const senderlName = req.user.lastName;
                const sender = senderfName.concat(" ", senderlName);
                const foodName = donation.foodName;
                const message = `${sender} wants to donate ${foodName}.`;
    
                for (const ngo of ngos) {
                    const notification = await NotificationService.sendNotification(senderId, ngo._id, message, "unread", new Date());
                    console.log(notification);
                }
    
                req.flash("success", "Donation request sent successfully");
    
                const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();
                res.redirect("/donor/donations/pending");
            }
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
    
});


router.get("/donor/donations/pending", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Food.find({ donor: req.user._id, status:"pending" }).populate({
            path: 'donor',
            model: User,
            select: '',
            
        }); 
		const notifications = await Notification.find({ recipient: req.user._id,status: 'unread' });

		res.render("donor/pendingDonations", { title: "Pending Donations", pendingDonations,notifications: notifications });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});


router.get("/donor/donations/previous", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Food.find({ donor: req.user._id, status:"collected"}).populate({
            path: 'ngo',
            model: User,
            select: '',
            
        });
		const notifications = await Notification.find({ recipient: req.user._id,status: 'unread' });
		res.render("donor/previousDonations", { title: "Previous Donations", previousDonations ,notifications: notifications });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/profile", middleware.ensureDonorLoggedIn, async (req,res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();

        res.render("donor/profile", { title: "My Profile", notifications: notifications });
    } catch(err) {
        console.error('Error fetching profile data:', err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});

router.put("/donor/profile", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.donor;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/donor/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

// Donor Route to View Feedback
router.get("/donor/donations/feedback/:collectionId", middleware.ensureDonorLoggedIn, async (req, res) => {
    try {
        const collectionId = req.params.collectionId;
        const collection = await Food.findById(collectionId);
        res.render("donor/previousDonations", { title: "Feedback", collection });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});


module.exports = router;