    const express = require("express");
    const router = express.Router();
    const middleware = require("../middleware/index.js");
    const User = require("../models/user.js");
    const Food = require("../models/food.js");
    const NGO = require("../models/ngo.js");
    const Donor = require("../models/donor.js");
    const NotificationService = require('../config/notificationService');
    const Notification = require('../models/notification.js'); // Corrected file path



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

 

    router.get("/ngo/donations/reject/:donationId", middleware.ensureNgoLoggedIn, async (req,res) => {
        try
        {
            const donationId = req.params.donationId;
            await Food.findByIdAndUpdate(donationId, { status: "rejected" });
            req.flash("success", "Donation rejected successfully");
            
            res.redirect(`/ngo/donations/pending`);
        }
        catch(err)
        {
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
            const updateObj = req.body.ngo;    // updateObj: {firstName, lastName, address, phone}
            await User.findByIdAndUpdate(id, updateObj);
            
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
            req.flash("success", "Donation collected successfully");

            const senderId = req.user._id;
            const sender = req.user.organisationName;
            const donorId = food.donor;
            const foodName = food.foodName;
            const message = `${sender} accepted your donation of ${foodName}`;
            const status = "unread"; 
            const timestamp = new Date(); 
            
            const notification = await NotificationService.sendNotification(senderId, donorId, message, status, timestamp);
            console.log(notification);
            const notifications = await Notification.find({ recipient: req.user._id, status: 'unread' }).exec();

            // req.flash("success", "Donation collected successfully");
            // res.redirect(`/ngo/collection/view/${collectionId}`);
            // res.redirect(`/ngo/collection/view/${collectionId}?notifications=${JSON.stringify(notifications)}`);\        res.render("ngo/collectionView", { title: "Collection View", collectionId, notifications });
            res.render("ngo/collection", { title: "Collection View", collectionId, notifications,notification,collection: collection });


        } catch (err) {
            console.log(err);
            req.flash("error", "Some error occurred on the server.");
            res.redirect("back");
        }
    });
    
    module.exports = router;
