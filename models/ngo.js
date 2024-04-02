const mongoose = require("mongoose");


const ngoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    selectedFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
    }]
});

const NGO = mongoose.model("NGO", ngoSchema);
module.exports = NGO;
