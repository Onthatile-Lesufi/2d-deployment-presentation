import dotenv from 'dotenv';
dotenv.config(); // Must be first

import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // In case you plan to add JWT later

const router = express.Router();

// Email transporter setup (use real credentials in prod)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  const { email, username, firstName, lastName, password, trivia, profilePic } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { username }] });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  try {
    if (!/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({
        message: 'Password must have at least 1 capital letter and 1 special character.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let hashedTrivia = {};
    if (trivia && typeof trivia === 'object') {
      for (const key in trivia) {
        if (trivia[key]) {
          hashedTrivia[key] = trivia[key];
        }
      }
    }

    const user = await User.create({
      email: cleanEmail,
      username,
      firstName,
      lastName,
      password: hashedPassword,
      trivia: hashedTrivia,
      profilePic // Save profilePic if provided
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic // Return profilePic
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic // Return profilePic
      // Optional: add token here
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// GET BY CONTACT (Safe)
router.post('/get-by-contact', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'No email provided' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      username: user.username,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CHECK USER EXISTS
router.post('/check-exists', async (req, res) => {
  const { email, username } = req.body;

  try {
    if (email && typeof email === 'string' && email.trim()) {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      return res.json({ exists: !!user });
    }

    if (username && typeof username === 'string' && username.trim()) {
      const user = await User.findOne({ username: username.trim() });
      return res.json({ exists: !!user });
    }

    return res.status(400).json({ message: 'No email or username provided' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PROFILE PIC
router.post('/update-profile-pic', async (req, res) => {
  const { email, profilePic } = req.body;
  if (!email || !profilePic) {
    return res.status(400).json({ message: 'Email and profilePic required' });
  }
  try {
    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { profilePic },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile picture' });
  }
});

export default router;
