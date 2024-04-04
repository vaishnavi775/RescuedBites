const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	organisationName: {
		type: String,
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		enum: ["male", "female"]
	},
	address: {
		type: String,
		
	},
	phone: {
		type: Number,
		
	},
	joinedTime: {
		type: Date,
		default: Date.now
	},
	role: {
		type: String,
		enum: ["ngo", "donor","admin"],
		required: true
	}
	
});

const User = mongoose.model("users", userSchema);
module.exports = User;