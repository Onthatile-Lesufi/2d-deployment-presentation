import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
    trim: true
  },
  lastName: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: false,
    unique: false,  // Not unique, but consider making it unique if your app demands
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    unique: false,
    trim: true
  },
  username: {
    type: String,
    required: false,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  trivia: {
    type: Object, // Example: { favDrink: string, firstPet: string, birthCity: string }
    required: false
  },
  profilePic: {
    type: String,
    required: false
  }
});

// Removed pre-save hook to avoid double hashing - you handle hashing in your routes

// Method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
