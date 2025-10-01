const mongoose = require("mongoose");
const Product = require("./Product");
const Reviews = require("./Reviews");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  weapon: {
    type: String,
    required: true,
  },
  victim: {
    type: String,
    required: true,
  },
  murderLocation: {
    type: String,
    required: true,
  },
  wishlist: {
    type: [String],
    default: []
  },
  role: {
    type: String,
    default: "user",
    enum: ["user","vendor", "admin"], //Prevents bad values 
  },
  cartIds: [{
    type: String,
    default: [],
  }]
});

module.exports = mongoose.model("Hitman_User", userSchema);
