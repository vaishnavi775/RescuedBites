const mongoose = require('mongoose')

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
    selector: {
        type: mongoose.Schema.Types.ObjectId, ref: 'NGO'
    }
})

const Food = mongoose.model('Food', foodSchema);

module.exports = Food