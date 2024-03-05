const mongoose = require('mongoose')
//const connectDB = require("../config/db");
const colors = require("colors");
const MONGO_URL = 'mongodb://127.0.0.1:27017/foodDonations'
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log(
            `Connected To Mongodb Database ${mongoose.connection.host}`.bgMagenta
                .white
        );
    } catch (error) {
        console.log(`Mongodb Database Error ${error}`.bgRed.white);
    }
};
connectDB();

const { Food } = require('./food')
const { Restaurant } = require('./restaurant')
const { NGO } = require('./ngo')

console.log('Schemas connected and ready.'.green);
