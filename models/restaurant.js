const mongoose = require("mongoose");
const User = require("./user");
const Food = require("./food"); 

const restaurantSchema = new mongoose.Schema({
    user: User,
    donatedFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }]
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;

