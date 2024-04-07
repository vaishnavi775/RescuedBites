const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Food = require("../models/food.js");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	const numDonors = await User.countDocuments({ role: "donor" });
	const numAgents = await User.countDocuments({ role: "ngo" });
	const numPendingDonations = await Food.countDocuments({ status: "pending" });
	const numCollectedDonations = await Food.countDocuments({ status: "collected" });
	res.render("admin/dashboard", {
		title: "Dashboard",
		 numDonors, numAgents, numPendingDonations,numCollectedDonations
	});
});


router.get("/admin/ngo", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const agents = await User.find({ role: "ngo" });
		res.render("admin/ngo", { title: "List of NGO", agents });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/ngo/:ngoId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const ngoId = req.params.ngoId;
		const person = await User.findById(ngoId)

		res.render("admin/detailsngo", { title: "Details", person });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.delete("/admin/ngo/:ngoId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const ngoId = req.params.ngoId;
		await User.findByIdAndDelete(ngoId)

		res.redirect("/admin/ngo");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/ngo/view/:ngoId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const ngoId = req.params.ngoId;
		const donation = await Food.find({ngo : ngoId}).populate({
            path: 'donor',
            model: User,
            select: '',
            
        });
		
		console.log(donation);
		res.render("admin/donationngo", { title: "Donation details", donation, ngoId });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donor", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donors = await User.find({ role: "donor" });
		res.render("admin/donor", { title: "List of Donors", donors });
		
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/donor/:donorId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donorId = req.params.donorId;
		const person = await User.findById(donorId)

		res.render("admin/detailsdonor", { title: "Details", person });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.delete("/admin/donor/:donorId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donorId = req.params.donorId;
		await User.findByIdAndDelete(donorId)

		res.redirect("/admin/donor");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donor/view/collected/:donorId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donorId = req.params.donorId;
		const donation = await Food.find({donor : donorId , status : "collected"}).populate({
            path: 'ngo',
            model: User,
            select: '',
            
        });
		
		console.log(donation);
		res.render("admin/donationdonor", { title: "Donation details", donation,donorId });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/donor/view/pending/:donorId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donorId = req.params.donorId;
		const donation = await Food.find({donor : donorId , status : "pending"}).populate({
            path: 'ngo',
            model: User,
            select: '',
            
        });
		
		console.log(donation);
		res.render("admin/donationdonor", { title: "Donation details", donation, donorId});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/donor/view/pending/:donorId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donorId = req.params.donorId;
		const donation = await Food.find({donor : donorId , status : "pending"}).populate({
            path: 'ngo',
            model: User,
            select: '',
            
        });
		
		console.log(donation);
		res.render("admin/donationdonor", { title: "Donation details", donation, donorId});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.delete("/admin/donor/view/pending/:donorId/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donorId = req.params.donorId;
		await Food.findById(donationId)
		res.redirect("/admin/donor/view/pending/:donorId")
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/profile", { title: "My profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/admin/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});


module.exports = router;