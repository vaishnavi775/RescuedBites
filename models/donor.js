const mongoose = require("mongoose");


const donorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    donatedFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    }]
});

const Donor = mongoose.model("Donor", donorSchema);
module.exports = Donor;
