const mongoose = require('mongoose');
const Restaurant = require("./restaurant");
const NGO = require("./ngo");

const foodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: true,
    },
    foodTag: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    expriyDate: {
        type: Date,
        required: true,
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'
    },
    ngo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'NGO'
    },
    status: {
		type: String,
		enum: ["available", "selected"],
		required: true
	},
})

const Food = mongoose.model('Food', foodSchema);

module.exports = Food