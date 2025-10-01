import express from 'express';
import http from 'http'; // Import HTTP for socket.io
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import nodemailer from 'nodemailer';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/public')));

console.log('MONGO_URI:', process.env.MONGO_URI);

// Multer upload setup (unchanged)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'client/public/uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });
// Remove old inline /api/upload route if present
// app.post('/api/upload', ...);

// Mount upload routes for profile pictures
app.use('/api', uploadRoutes);
app.use('/api/users', uploadRoutes); // Allow /api/users/upload-profile-pic for compatibility

// API routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);



// --- Admin Model using Mongoose ---

// Define Admin schema/model (if not already created)
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.models && mongoose.models.Admin
  ? mongoose.models.Admin
  : mongoose.model('Admin', adminSchema);

// --- Admin Registration Endpoint ---
app.post('/api/admin/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (!email.endsWith('@virtualwindow.co.za')) return res.status(403).json({ message: 'Invalid admin email' });

  try {
    const exists = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Admin already registered.' });

    // For production, hash the password!
    const admin = new Admin({ email: email.trim().toLowerCase(), password });
    await admin.save();
    res.status(201).json({ message: 'Admin registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Admin Login Endpoint ---
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) return res.status(404).json({ message: 'Not a regristed admin' });
    // For production, compare hashed passwords!
    if (admin.password !== password) return res.status(401).json({ message: 'Incorrect password' });

    res.json({ message: 'Admin login successful', email: admin.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// SellerApplication model
const sellerApplicationSchema = new mongoose.Schema({
  businessName: String,
  ownerName: String,
  email: String,
  phone: String,
  businessType: String,
  registrationNumber: String,
  productTypes: String,
  website: String,
  confirmLicensed: Boolean,
  liquorLicenseFile: String, // path to uploaded file
  createdAt: { type: Date, default: Date.now }
});
const SellerApplication = mongoose.models.SellerApplication || mongoose.model('SellerApplication', sellerApplicationSchema);

// Add status field to SellerApplication if not present
// (If you want to default to "Pending" on new applications)
if (!sellerApplicationSchema.paths.status) {
  sellerApplicationSchema.add({ status: { type: String, default: "Pending" } });
}

// Seller application endpoint (local file storage, like product images)
app.post('/api/seller/apply', upload.single('licenseFile'), async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      businessType,
      registrationNumber,
      productTypes,
      website,
      confirmLicensed
    } = req.body;

    if (!businessName || !ownerName || !email || !phone || !businessType || !registrationNumber || !productTypes || !req.file) {
      return res.status(400).json({ message: 'Missing required fields or file' });
    }

    // Save application to MongoDB, store file path
    const application = new SellerApplication({
      businessName,
      ownerName,
      email,
      phone,
      businessType,
      registrationNumber,
      productTypes,
      website,
      confirmLicensed: confirmLicensed === "true" || confirmLicensed === true,
      liquorLicenseFile: `/uploads/${req.file.filename}`
    });
    await application.save();

    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"The Drunken Giraffe" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Seller Application Received",
        html: `
          <h2>Thank you for your application!</h2>
          <p>Dear ${ownerName || businessName},</p>
          <p>We have received your seller application and liquor license. Our team will review your submission and contact you soon.</p>
          <p>Best regards,<br/>The Drunken Giraffe Team</p>
        `
      });
    } catch (mailErr) {
      console.error('Failed to send confirmation email:', mailErr);
    }

    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Endpoint to get all seller applications (for admin dashboard)
app.get('/api/seller/applications', async (req, res) => {
  try {
    const applications = await SellerApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH endpoint to update seller application status
app.patch('/api/seller/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const application = await SellerApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Send acceptance email if status is Approved
    if (status === "Approved") {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"The Drunken Giraffe" <${process.env.EMAIL_USER}>`,
          to: application.email,
          subject: "Seller Application Approved",
          html: `
            <h2>Congratulations!</h2>
            <p>Dear ${application.ownerName || application.businessName},</p>
            <p>Your seller application has been <b>approved</b>! Please wait for a follow-up email with your login details and next steps.</p>
            <p>Thank you for joining The Drunken Giraffe.</p>
            <p>Best regards,<br/>The Drunken Giraffe Team</p>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send acceptance email:', mailErr);
      }
    }

    // Send rejection email if status is Rejected
    if (status === "Rejected") {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"The Drunken Giraffe" <${process.env.EMAIL_USER}>`,
          to: application.email,
          subject: "Seller Application Rejected",
          html: `
            <h2>Application Update</h2>
            <p>Dear ${application.ownerName || application.businessName},</p>
            <p>We regret to inform you that your seller application has been <b>rejected</b>.</p>
            <p>If you believe this was a mistake or need more information, please contact our support team at <a href="mailto:support@thedrunkengiraffe.com">support@thedrunkengiraffe.com</a>.</p>
            <p>Best regards,<br/>The Drunken Giraffe Team</p>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send rejection email:', mailErr);
      }
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Seller model (for registered sellers)
const sellerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For production, hash this!
  email: { type: String, required: true, unique: true },
  businessName: String,
  ownerName: String,
  createdAt: { type: Date, default: Date.now }
});
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

// Seller registration endpoint (called by admin from dashboard)
app.post('/api/sellers/register', async (req, res) => {
  const { username, password, email, businessName, ownerName } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    let seller = await Seller.findOne({ email });
    if (seller) {
      // Update username and password for existing seller
      seller.username = username;
      seller.password = password; // For production, hash the password!
      await seller.save();
      return res.status(200).json({ message: "Seller updated", seller });
    }
    // Otherwise, create new seller
    seller = new Seller({ username, password, email, businessName, ownerName });
    await seller.save();
    res.status(201).json({ message: "Seller registered", seller });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Seller login endpoint
app.post('/api/sellers/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  try {
    const seller = await Seller.findOne({ username });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    // For production, compare hashed passwords!
    if (seller.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    res.json({
      username: seller.username,
      email: seller.email,
      businessName: seller.businessName,
      ownerName: seller.ownerName
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// HTTP + Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (msg) => {
    console.log('New message:', msg);
    // Broadcast to all clients
    io.emit('receiveMessage', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected');
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Your error means the package "socket.io" is not installed in your server directory.

// To fix, run this command in your server folder:
// npm install socket.io

// After install, run `npm start` again.

// Update productRoutes.js or add this filter to your products endpoint if not already present:
app.get('/api/products', async (req, res) => {
  try {
    const filter = {};
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }
    // Only filter by companyName if seller is not specified
    if (req.query.companyName && !req.query.seller) {
      filter.companyName = req.query.companyName;
    }
    // ...add more filters as needed...
    const products = await mongoose.model('Product').find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});