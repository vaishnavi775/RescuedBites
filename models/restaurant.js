const mongoose = require('mongoose')

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    donatedFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }]
})
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant