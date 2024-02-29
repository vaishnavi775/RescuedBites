const mongoose = require("mongoose");
const colors = require("colors");
const MONGO_URL = 'mongodb+srv://vaishnavi:vaish%40mongo@cluster0.2li03ai.mongodb.net/foodDonations'
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

module.exports = connectDB;
