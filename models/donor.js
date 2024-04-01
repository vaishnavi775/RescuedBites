const mongoose = require("mongoose");
const User = require("./user");
const Food = require("./food"); 

const donorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    donatedFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }]
});

const Donor = mongoose.model("Donor", donorSchema);
module.exports = Donor;

