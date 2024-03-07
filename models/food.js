const mongoose = require('mongoose')

const foodSchema = new mongoose.Schema({
    foodName:{
        type: String,
        required: true,
    },
    foodTag: {
        type:String,
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
    user: {
        type: mongoose.Schema.Types.ObjectId, ref:'User'
    }
});