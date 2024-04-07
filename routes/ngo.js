const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Food = require("../models/food.js");
const NGO = require("../models/ngo.js");
const Donor = require("../models/donor.js");
// Import required modules
const bodyParser = require("body-parser");

// Use middleware to parse URL-encoded form data
router.use(bodyParser.urlencoded({ extended: true }));


router.get("/ngo/dashboard", middleware.ensureNgoLoggedIn, async (req,res) => {
    const numPendingDonations = await Food.countDocuments({status: "pending" });
    const numAcceptedDonations = await Food.countDocuments({ ngo: req.user._id, status: "accepted" });
    const numCollectedDonations = await Food.countDocuments({ ngo: req.user._id, status: "collected" });
    res.render("ngo/dashboard", {
        title: "Dashboard",
        numPendingDonations, numAcceptedDonations, numCollectedDonations
    });
});

router.get("/ngo/donations/pending", middleware.ensureNgoLoggedIn, async (req, res) => {
    try {
        const pendingCollections = await Food.find({ status: "pending" }).populate({
            path: 'donor',
            model: User,
            select: '',
            
        });      
        res.render("ngo/pendingCollections", { title: "Pending Collections", pendingCollections });

    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});

router.get("/ngo/donations/accept/:donationId", middleware.ensureNgoLoggedIn, async (req,res) => {
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
        const previousCollections = await Food.find({ngo: req.user._id, status: "collected" }).populate({
            path: 'donor',
            model: User,
            select: '',
            
        });  
        res.render("ngo/previousCollections", { title: "Previous Collections", previousCollections });
    } catch (err) {
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

router.get("/ngo/collection/view/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
    try {
        const collectionId = req.params.collectionId;
        const collection = await Food.findById(collectionId).populate({
            path: 'donor',
            model: User,
            select: '',
            
        });
        res.render("ngo/collection", { title: "Collection details", collection });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }
});


router.get("/ngo/collection/collect/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
    try {
        const collectionId = req.params.collectionId;
        // Find the food item by collectionId
        const food = await Food.findById(collectionId);
        if (!food) {
            req.flash("error", "Food item not found");
            return res.redirect("back");
        }
        
        // Update the food item status and ngo fields
        food.status = "collected";
        food.collectionTime = Date.now();
        food.ngo = req.user._id; // Assuming req.user contains the authenticated NGO's user object
        
        // Save the updated food item
        await food.save();
        // console.log(food)
        req.flash("success", "Donation collected successfully");
        res.redirect(`/ngo/collection/view/${collectionId}`);
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.")
        res.redirect("back");
    }

    // router.get("/ngo/donations/feedback/:donationId", middleware.ensureNgoLoggedIn, async (req, res) => {
    //     try {
    //         const donationId = req.params.donationId;
    //         const donation = await Donation.findById(donationId);
    //         res.render("ngo/feedback", { title: "Add Feedback", donation });
    //     } catch (err) {
    //         console.log(err);
    //         req.flash("error", "Some error occurred on the server.")
    //         res.redirect("back");
    //     }
    // });
    
    // router.post("/ngo/donations/feedback/:donationId", middleware.ensureNgoLoggedIn, async (req, res) => {
    //     try {
    //         const donationId = req.params.donationId;
    //         const feedback = req.body.feedback;
    //         await Donation.findByIdAndUpdate(donationId, { feedback: feedback });
    //         req.flash("success", "Feedback added successfully");
    //         res.redirect("/ngo/donations/previous");
    //     } catch (err) {
    //         console.log(err);
    //         req.flash("error", "Some error occurred on the server.")
    //         res.redirect("back");
    //     }
    // });
});

router.get("/ngo/feedback/:collectionId", middleware.ensureNgoLoggedIn, async (req, res) => {
    try {
        const collectionId = req.params.collectionId;
        const collection = await Food.findById(collectionId); // Assuming this is how you fetch the collection object
        res.render("ngo/feedback", { title: "Feedback", collection }); // Pass the collection object to the view
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
        const food = await Food.findByIdAndUpdate(collectionId, { adminToAgentMsg: feedback });
        req.flash("success", "Feedback sent successfully");
        res.redirect("/ngo/donations/previous");
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});



module.exports = router;
