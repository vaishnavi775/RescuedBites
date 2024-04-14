const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Food = require("../models/food.js");
const nodemailer = require("nodemailer");
const Donor = require("../models/donor.js");

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
		const ngo = await User.findById(ngoId);

        if (!ngo) {
            req.flash("error", "Donor not found");
            return res.redirect("back");
        }


		if (ngo && ngo.email) {
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
                to: ngo.email,
                subject: 'Account Deletion',
                html: `<h2>Account Deleted</h2> 
                <p>Hello ${ngo.firstName},</p>
                <p>Your account has been deleted by RescuedBites.</p>
                <p>If you have any questions, please contact us.</p>`
            };


			await transporter.sendMail(mailOptions);
			await User.findByIdAndDelete(ngoId)	}
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
		const donor = await User.findById(donorId);

        if (!donor) {
            req.flash("error", "Donor not found");
            return res.redirect("back");
        }


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
                subject: 'Account Deletion',
                html: `<h2>Account Deleted</h2> 
                <p>Hello ${donor.firstName},</p>
                <p>Your account has been deleted by RescuedBites.</p>
                <p>If you have any questions, please contact us.</p>`
            };


			await transporter.sendMail(mailOptions);
			await User.findByIdAndDelete(donorId);

        } else {
            req.flash("error", "Donor email not found.");
	}
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
		const donation = await Food.find({donor : donorId , status : "pending"});
		res.render("admin/donationdonor", { title: "Donation details", donation, donorId});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.delete("/admin/donor/view/pending/:donorId/:donationId", middleware.ensureAdminLoggedIn, async (req, res) => {
    try {
        const donationId = req.params.donationId;
        const donorId = req.params.donorId;

        const donation = await Food.findById(donationId);
        if (!donation) {
            req.flash("error", "Donation not found");
            return res.redirect("back");
        }
		const donor = await User.findById(donorId);


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
                subject: 'Donation Deleted',
                html: `<h2>Donation Deleted</h2> 
                <p>Hello ${donor.firstName},</p>
                <p>We regret to inform you that your pending donation has been deleted by RescuedBites.</p>
                <p>If you have any questions, please contact us.</p>`
            };


            await transporter.sendMail(mailOptions); 
			
   
            await Food.findByIdAndDelete(donationId);
																			
        } else {
            req.flash("error", "Donor email not found.");
        }
		res.redirect(`/admin/donor/view/pending/${donorId}`);
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
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
		const updateObj = req.body.admin;	
		const number = req.body.donor;
		await User.findByIdAndUpdate(id, updateObj);
		await User.findByIdAndUpdate(id, number);
		console.log(req.body);
		
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