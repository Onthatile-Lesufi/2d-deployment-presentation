import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, required: true },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }, // Added field for Like system
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
