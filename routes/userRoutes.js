const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // For session persistence
const bcrypt = require("bcrypt");
const User = require("../models/User");

const app = express();
const router = express.Router();

// Session middleware configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Replace with your MongoDB connection string
      collectionName: "sessions",
    }),
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      sameSite: "Lax", // Use 'None' if working cross-origin with credentials
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

router.post("/register", async (req, res) => {
  const { email, password, weapon, victim, murderLocation } = req.body;
  try {
    console.log("Backend data recieved: " + req.body);
    console.time("Securing the dataaaaaaaa");
    let hashedPassword = await bcrypt.hash(password, 13);
    console.log(`Hashed Password: ${hashedPassword}`);
    let hashedWeapon = await bcrypt.hash(weapon, 10); //I want to keep logging in below 1s, so a salt of 10 should be fine. Keeps within the minimum :)
    console.timeEnd("Securing the dataaaaaaaa");
    console.log(`Hashed Weapon: ${hashedWeapon}`);
    let hashedVictim = await bcrypt.hash(victim, 10);
    let murderLocationHash = await bcrypt.hash(murderLocation, 10);
    const user = new User({
      email,
      password: hashedPassword,
      weapon: hashedWeapon,
      victim: hashedVictim,
      murderLocation: murderLocationHash,
      role: "user",
    });
    await user.save();
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login route with session storage
router.post("/login", async (req, res) => {
  const { email, password, weapon, victim, murderLocation } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    if (!(await bcrypt.compare(weapon, user.weapon))) {
      return res.status(401).json({ error: "Incorrect weapon" });
    }

    if (!(await bcrypt.compare(victim, user.victim))) {
      return res.status(401).json({ error: "Incorrect victim" });
    }

    if (!(await bcrypt.compare(murderLocation, user.murderLocation))) {
      return res.status(401).json({ error: "Incorrect location" });
    }

    // Store only non-sensitive user details in the session
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    req.session.authenticated = true;

    res.status(200).json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logged-in user route
router.get("/logged", async (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({ message: "Login successful", user });
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.clearCookie("connect.sid"); // Clear the session cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);

    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/:email", async (req, res) => {
  try {
    const users = await User.findOne({ email: req.params.email });
    console.log(users);

    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/wishlist/:email", async (req, res) => {
  const { productID } = req.body;
  console.log(req.params.email);
  try {
    const user = await User.findOne({ email: req.params.email });
    console.log(user.wishlist);

    if (!user) {
      return res.status(404).json({ message: "Cannot find user" });
    }
    if (!user.wishlist.includes(productID)) {
      user.wishlist.push(productID);
      await user.save();
      console.log("Successfully added to wishlist");

      res.status(200).json({ message: "Successfully added to wishlist" });
      console.log(user.wishlist);
    } else {
      console.log("attempting to remove");
      const index = user.wishlist.findIndex((id) => id === productID);

      user.wishlist.splice(index, 1);
      await user.save();
    }
    res.status(200).json({ message: "Successfully removed from wishlist" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/cart/:email", async (req, res) => {
  const { productID } = req.body;
  console.log(req.params.email);
  try {
    const user = await User.findOne({ email: req.params.email });
    console.log(user.cartIds);

    if (!user) {
      return res.status(404).json({ message: "Cannot find user" });
    }
    user.cartIds.push(productID);
    await user.save();
    console.log("Successfully added to wishlist");
    res.status(200).json({ message: "Successfully added to wishlist" });
    console.log(user.wishlist);
  } catch (error) {
    console.log("Error Adding to wishlist" + error);
  }
});

router.put("/removeFromCart/:email", async (req, res) => {
  const { productID } = req.body;
  console.log(req.params.email);
  try {
    const user = await User.findOne({ email: req.params.email });
    console.log(productID); 
    
    user.cartIds = user.cartIds.filter(id => id !== productID);
    await user.save();
    res.status(200).json({message: "Removed field"});
  } catch (error) {
    console.log("Error removing item from cart" + error);
  }
});
router.put("/clearCart/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    user.cartIds = [];
    await user.save();
    res.status(200).json({message: "Cleared Cart"});
  } catch (error) {
    console.log("Error clearing cart" + error);
  }
});

router.put("/removeOneFromCart/:email", async (req, res) => {
  const { productID } = req.body;
  console.log(req.params.email);
  try {
    const user = await User.findOne({ email: req.params.email });
    const index = await user.cartIds.findIndex((id) => id==productID);
    console.log(productID);
    
    user.cartIds.splice(index,1);
    await user.save();
    res.status(200).json({message: "Removed field"});
  } catch (error) {
    console.log("Error Adding to wishlist" + error);
  }
});

router.put("/promoteAdmin/:email", async (req, res) => {
  console.log(req.params.email);
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res
        .status(404)
        .json({
          message: "Unable to find user matching given email to promote",
        });
    }
    user.role = "admin";
    await user.save();
    console.log("Promoted user to admin success!");
    res.status(200).json({ message: "User promoted successfully" });
  } catch (error) {}
});

// Decrease quantity of a product in cart
router.put('/decreaseFromCart/:email', async (req, res) => {
  const { email } = req.params;
  const { productID } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).send("User not found");

    const index = user.cartIds.indexOf(productID);
    if (index !== -1) {
      user.cartIds.splice(index, 1); // Remove one instance
      await user.save();
          res.status(200).json({ message: "Product quantity increased" })
    } else {
      return res.status(400).send("Product not in cart");
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.put("/increaseFromCart/:email", async (req, res) => {
  const { productID } = req.body;
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cartIds.push(productID); // Add another of the same product
    await user.save();

    res.status(200).json({ message: "Product quantity increased" });
  } catch (error) {
    console.error("Error increasing quantity:", error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
