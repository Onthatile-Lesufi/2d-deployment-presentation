const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const path = require("path");

// Load environment variables from .env file
dotenv.config();

// Initialise express app
const app = express();
console.log(process.env.MONGODB_URI);

// Use CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.json({limit: '1mb'}));

// Use Express session
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: true,
        maxAge: parseInt(process.env.MAX_COOKIE_AGE) || 86400000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// User Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../frontend/build")));
    app.get('', (_, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('Error connecting to mongodb', err);
    process.exit(1);
});