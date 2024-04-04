const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const homeRoutes = require("./routes/home.js");
const authRoutes = require("./routes/auth.js");
// const adminRoutes = require("./routes/admin.js");
const donorRoutes = require("./routes/donor.js");
const ngoRoutes = require("./routes/ngo.js");
const firebase = require("firebase/compat/app");
require("firebase/compat/auth"); 
require("firebase/compat/messaging");


require("dotenv").config();
require("./config/dbConnection.js")();
require("./config/passport.js")(passport);



app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/assets", express.static(__dirname + "/assets"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(methodOverride("_method"));
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	res.locals.warning = req.flash("warning");
	next();
});



// Routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(donorRoutes);
// app.use(adminRoutes);
app.use(ngoRoutes);
app.use((req,res) => {
	res.status(404).render("404page", { title: "Page not found" });
});

const firebaseConfig = {
	apiKey: "AIzaSyCkVyrGc9AsGZ8yrIHKFuNQ8JlfXZ0aHws",
	authDomain: "rescued-bites.firebaseapp.com",
	projectId: "rescued-bites",
	storageBucket: "rescued-bites.appspot.com",
	messagingSenderId: "377228971007",
	appId: "1:377228971007:web:96ec6549d9a3c47c85b5ca",
	measurementId: "G-VRYYB9H6MM"
	};
console.log("Firebase Configuration:", firebaseConfig);
firebase.initializeApp(firebaseConfig);
// Listen for Firebase initialization events
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log("Firebase initialized successfully. User:", user);
  } else {
    console.log("Firebase initialized successfully. No user signed in.");
  }
});


const port = process.env.PORT || 5001;
app.listen(port, console.log(`Server is running at http://localhost:${port}`));

