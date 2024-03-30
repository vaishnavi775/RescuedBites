const mongoose = require('mongoose')
const ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    selectedFood: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
    }]
});
const NGO = mongoose.model('NGO', ngoSchema);

module.exports = NGO