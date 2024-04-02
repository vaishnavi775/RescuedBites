const express = require("express");
const router = express.Router();

router.get("/", (req,res) => {
	res.render("home/welcome");
});

// router.get("/home/about-us", (req,res) => {
// 	res.render("home/aboutUs", { title: "About Us | Rescued Bites" });
// });

// router.get("/home/mission", (req,res) => {
// 	res.render("home/mission", { title: "Our mission | Rescued Bites" });
// });

// router.get("/home/contact-us", (req,res) => {
// 	res.render("home/contactUs", { title: "Contact us | Rescued Bites" });
// });


module.exports = router;