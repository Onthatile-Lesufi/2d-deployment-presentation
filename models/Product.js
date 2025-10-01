const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique:true,
    },
    description: {
        type: String,
        required: true,
    },
    price: { 
        type: Number,
        required: true,
    },
    image: { //insert clickbait here
        type: String,
        required: true,
    },
    rating: { //Out of 5
        type: Number,
        required: true,
    },
    vendor: { //guy selling product
        type: String,
        required: true,
    },
    type: { //product or service
       type: String,
        enum: ['product', 'service'],
        default: 'product',
        required: true
    },
    status: {
        type:String,
        enum: ['pending', 'approved', 'flagged'],
        default: 'pending',
    }
});

module.exports = mongoose.model('Product', productSchema);