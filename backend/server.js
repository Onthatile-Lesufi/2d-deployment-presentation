const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

//load enviornment variables from .env file
dotenv.config();

//Initialise express app
const app = express();
const PORT = process.env.PORT || 5000;
console.log(process.env.MONGODB_URI);

// Use CORS
app.use(cors({
  origin: __dirname,
  credentials: true
}));

app.use(express.static(path.join(__dirname,"./frontend/build")));

app.get ("*", function (_,res) {
    res.sendFile (
        path.join(__dirname, "./frontend/build/index.html"),
        function (err) {
            if (err) res.status(500).send(err);
        }
    );
});

//Middleware to parse JSON bodies
app.use(express.json({limit: '1mb'}));

// Use Express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: true,
        maxAge: parseInt(process.env.MAX_COOKIE_AGE),
        sameSite: 'lax',
        secure: false
    }
}))

// app.use((req,res,next) => {
//     console.log(req.session);
// });

//MONGODB connection 
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//User Routes

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then( () => console.log('MongoDB connected'))
.catch(err => console.error('Error connecting to mongodb',err));


//Start the server
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes)

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes)

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes)

const requireAuth = (req, res, next) => {
    const {user} = req.session;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

const requireAdmin = (req,res,next) => {
    const [user] = req.session;
    if (!user || user.role != "admin"){
        return res.status(401).json({ message : 'Unauthorized'});
    }
    next();
}
