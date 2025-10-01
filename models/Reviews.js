const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
    },
    review: {
        type: String,
    },
    userEmail: {
        type: String,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("reviews", reviewSchema);
