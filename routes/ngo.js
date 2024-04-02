const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Food = require("../models/food.js");
const NGO = require("../models/ngo.js");

router.get("/ngo/dashboard", middleware.ensureNgoLoggedIn, async (req,res) => {
    const numPendingDonations = await Food.countDocuments({ status: "pending" });
    const numAcceptedDonations = await Food.countDocuments({ status: "accepted" });
    const numCollectedDonations = await Food.countDocuments({ status: "collected" });
    res.render("ngo/dashboard", {
        title: "Dashboard",
        numPendingDonations, numAcceptedDonations, numCollectedDonations
    });
});

router.get("/ngo/donations/pending", middleware.ensureNgoLoggedIn, async (req,res) => {
    try
    {
        const pendingDonations = await Food.find({ status: "pending" }).populate("donor");
        res.render("ngo/pendingDonations", { title: "Pending Donations", pendingDonations });
    }
    catch(err)
    {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});

router.get("/ngo/donation/accept/:donationId", middleware.ensureNgoLoggedIn, async (req,res) => {
    try
    {
        const donationId = req.params.donationId;
        await Food.findByIdAndUpdate(donationId, { status: "accepted" });
        req.flash("success", "Donation accepted successfully");
        res.redirect(`/ngo/donations/pending`);
    }
    catch(err)
    {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});

router.get("/ngo/donation/reject/:donationId", middleware.ensureNgoLoggedIn, async (req,res) => {
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

router.get("/ngo/profile", middleware.ensureNgoLoggedIn, (req,res) => {
    res.render("ngo/profile", { title: "My Profile" });
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

module.exports = router;
