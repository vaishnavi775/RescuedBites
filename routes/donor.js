const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Food = require("../models/food.js");


router.get("/donor/dashboard", middleware.ensureDonorLoggedIn, async (req,res) => {
	const donorId = req.user._id;
	const numPendingDonations = await Food.countDocuments({ donor: donorId, status: "pending" });
	const numAcceptedDonations = await Food.countDocuments({ donor: donorId, status: "collected" });
	// const numCollectedDonations = await Food.countDocuments({ donor: donorId, status: "collected" });
	const numCollectedDonations = numPendingDonations + numAcceptedDonations;
	res.render("donor/dashboard", {
		title: "Dashboard",
		numPendingDonations, numAcceptedDonations,numCollectedDonations
	});
});

router.get("/donor/donate", middleware.ensureDonorLoggedIn, async (req,res) => {
	res.render("donor/donate", { title: "Donate" });
});

router.post("/donor/donate", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const donation = req.body.donation;
		donation.status = "pending";
		donation.donor = req.user._id;
		const newDonation = new Food(donation);
		await newDonation.save();
		req.flash("success", "Donation request sent successfully");
		res.redirect("/donor/donations/pending");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/donations/pending", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		//const pendingDonations = await Food.find({ donor: req.user._id, status:["pending", "accepted"] }).populate("ngo")
		const pendingDonations = await Food.find({ donor: req.user._id, status:"pending" }).populate({
            path: 'donor',
            model: User,
            select: '',

        });  
		res.render("donor/pendingDonations", { title: "Pending Donations", pendingDonations });
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
		//const previousDonations = await Food.find({ donor: req.user._id, status: "collected" }).populate({
		const previousDonations = await Food.find({ donor: req.user._id, status:"collected"}).populate({
            path: 'ngo',
            model: User,
            select: '',

    
        });
		res.render("donor/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/donation/deleteRejected/:donationId", async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndDelete(donationId);
		res.redirect("/donor/donations/pending");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/profile", middleware.ensureDonorLoggedIn, (req,res) => {
	res.render("donor/profile", { title: "My Profile" });
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