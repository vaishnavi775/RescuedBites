
    const express = require("express");
    const router = express.Router();
    const middleware = require("../middleware/index.js");
    const User = require("../models/user.js");
    const Food = require("../models/food.js");
    const NGO = require("../models/ngo.js");
    const Donor = require("../models/donor.js");
    const NotificationService = require('../config/notificationService');
    const Notification = require('../models/notification.js'); // Corrected file path
    const nodemailer = require('nodemailer');


    router.get('/ngo/notification', async (req, res) => {
        try {
            const notifications = await Notification.find({ recipient: req.user._id }).sort({ timestamp: -1 });
            await Notification.updateMany({ recipient: req.user._id }, { $set: { status: 'read' } });
            const unreadCount = await NotificationService.getUnreadNotificationCount(req.user._id);
            console.log("", unreadCount);
            res.render("ngo/notification", { title: "Notifications", notifications: notifications, unreadCount: unreadCount});
    
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.get("/ngo/dashboard", middleware.ensureNgoLoggedIn, async (req,res) => {
        const numPendingDonations = await Food.countDocuments({ status: "pending" });
        const numAcceptedDonations = await Food.countDocuments({ ngo: req.user._id,status: "accepted" });
        const numCollectedDonations = await Food.countDocuments({ ngo: req.user._id,status: "collected" });
        const notifications = await Notification.find({ recipient: req.user._id,status: 'unread' });

        res.render("ngo/dashboard", {
            title: "Dashboard",
            numPendingDonations, numAcceptedDonations, numCollectedDonations,notifications: notifications
        });
    });
    
    router.get("/ngo/donations/pending", middleware.ensureNgoLoggedIn, async (req, res) => {
        try {
            const pendingCollections = await Food.find({ status: "pending" }).populate({
                path: 'donor',
                model: User,
                select: '',
                
            });     
            const notifications = await Notification.find({ recipient: req.user._id,status: 'unread' });
 
            res.render("ngo/pendingCollections", { title: "Pending Collections", pendingCollections,notifications: notifications });

        } catch (err) {
            console.log(err);
            req.flash("error", "Some error occurred on the server.")
            res.redirect("back");
        }
    });

 

    router.get("/ngo/donations/previous", middleware.ensureNgoLoggedIn, async (req, res) => {
        try {
            const previousCollections = await Food.find({ngo: req.user._id,status: "collected" }).populate({
                path: 'donor',
                model: User,
                select: '',
                
            }); 
            const notifications = await Notification.find({ recipient: req.user._id,status: 'unread' });
 
            res.render("ngo/previousCollections", { title: "Previous Collections", previousCollections,notifications: notifications });
        } catch (err) {
            console.log(err);
            req.flash("error", "Some error occurred on the server.")
            res.redirect("back");
        }
    });



    router.get("/ngo/profile",middleware.ensureNgoLoggedIn, async (req,res) => {
        try {
            const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();
    
            res.render("ngo/profile", { title: "My Profile", notifications: notifications });
        } catch(err) {
            console.error('Error fetching profile data:', err);
            req.flash("error", "Some error occurred on the server.")
            res.redirect("back");
        }

    });
    router.put("/ngo/profile", middleware.ensureNgoLoggedIn, async (req,res) => {
        try
        {
            const id = req.user._id;
            const updateObj = req.body.ngo;
            const number = req.body.donor;
            await User.findByIdAndUpdate(id, updateObj);
            await User.findByIdAndUpdate(id, number);
            console.log(req.body);
            console.log(updateObj);
            

            req.flash("success", "Profile updated successfully");
            res.redirect("/ngo/profile");
        }
        catch(err)
        {
            console.log(err);
            req.flash("error", "Some error occurred on the server.")
            res.redirect("back");
        }
    });

    router.get("/ngo/collection/view/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
        try {
            const collectionId = req.params.collectionId;
            const collection = await Food.findById(collectionId).populate({
                path: 'donor',
                model: User,
                select: '',
                
            });
            const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();

            res.render("ngo/collection", { title: "Collection details", collection,notifications: notifications });
        } catch (err) {
            console.log(err);
            req.flash("error", "Some error occurred on the server.")
            res.redirect("back");
        }
    });



    router.get("/ngo/collection/collect/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
        try {
            const collectionId = req.params.collectionId;
            const food = await Food.findById(collectionId);
            if (!food) {
                req.flash("error", "Food item not found");
                return res.redirect("back");
            }

            food.status = "collected";
            food.collectionTime = Date.now();
            food.ngo = req.user._id; 

            await food.save();
            console.log(food)
            req.flash("success", "Donation request accepted");
            const donorid = food.donor._id;
            const donor = await User.findById(donorid);
            console.log(donor.email);
            if (donor && donor.email) {
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
                    to: donor.email,
                    subject: 'Donation Request Accepted',
                    html: `<h2>Donation Request Accepted</h2> 
                    <p>Hello ${donor.firstName},</p>
                    <p>Your donation request of ${food.foodName} has been accepted by ${req.user.organisationName}. You will be contacted by them soon.</p>`
                };
    
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                        // req.flash("error", "Failed to send email to the donor.");
                    } else {
                        console.log('Email sent:', info.response);
                        // req.flash("success", "Collection confirmed. Email sent to the donor.");
                    }
                });
            } else {
                req.flash("error", "Donor email not found.");
            }
            const senderId = req.user._id;
            const sender = req.user.organisationName;
            const donorId = food.donor._id;
            const foodName = food.foodName;
            const message = `${sender} accepted your donation request of ${foodName}`;
            const status = "unread"; 
            const timestamp = new Date(); 

            await NGO.findOneAndUpdate({ user: req.user._id},{$push:{selectedFood: food}},{upsert : true});
            
            const notification = await NotificationService.sendNotification(senderId, donorId, message, status, timestamp);
            console.log(notification);
            const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();

            res.redirect(`/ngo/collection/view/${collectionId}`);

        } catch (err) {
            console.log(err);
            req.flash("error", "Some error occurred on the server.");
            res.redirect("back");
        }

    });
    

router.get("/ngo/feedback/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
    try {
        const collectionId = req.params.collectionId;
        const collection = await Food.findById(collectionId); // Assuming this is how you fetch the collection object
        const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();
        res.render("ngo/feedback", { title: "Feedback", collection, notifications:notifications }); // Pass the collection object to the view
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});


router.post("/ngo/feedback/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
    try {
        const collectionId = req.params.collectionId;
        const feedback = req.body.feedback;
        const food = await Food.findByIdAndUpdate(collectionId, { ngoToDonorMsg: feedback });
        req.flash("success", "Feedback sent successfully");
        res.redirect("/ngo/donations/previous");
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});



module.exports = router;
