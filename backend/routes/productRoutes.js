const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const Review = require("../models/Reviews");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/register", async (req, res) => {

   console.log("Received from frontend my friend:", req.body);  // <-- Add it here

  const { productName, description, price, image, rating, vendor, type } =
    req.body;
  try {
    console.log(req.body);
    const product = new Product({
      productName,
      description,
      price,
      image,
      rating : 0,
      vendor,
      type 
    });
    console.log("Product created");

    await product.save();
    console.log("Product saved");

    res.status(201).json({ product });
    console.log(req.body);
  } catch (err) {
  console.error("Error saving product:", err.message);
  if (err.errors) {
    for (const key in err.errors) {
      console.error(`${key}: ${err.errors[key].message}`);
    }
  }
  res.status(400).json({ error: err.message });
}
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Invalid product ID or server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  const { productName, description, price, image, rating, vendor, type } =
    req.body;
  console.log("Updating...");
  console.log(req.body);
  
  try {
    const product = await Product.findById(req.params.id);
    product.productName = productName ?? product.productName;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.image = image ?? product.image;
    product.rating = rating ?? product.rating;
    product.vendor = vendor ?? product.vendor;
    product.type = type ?? product.type;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.log("error updating data: " + error);
  }
});
router.put("/updateStatus/:id", async (req, res) => {
  const { status } =
    req.body;
  console.log("Updating...");
  
  try {
    const product = await Product.findById(req.params.id);
    product.status = status ?? product.status;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.log("error updating data: " + error);
  }
});

// Deleting a Product
// router.delete ('/delete/:id', getProduct, async (req, res) => {
//     try {
//         await res.product.deleteOne();
//         res.json({ message: 'Deleted Product' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }

// });
router.delete ('/delete/:id', async (req, res) => {
    console.log("Attempting to delete product");
    console.log(req.params.id);
    
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        console.log(deletedProduct);
        if (!deletedProduct) {
            return res.status(400).json({message: "product not found"});
        }
        res.json({message: "Product deleted", deletedProduct})
    } catch (error) {
        console.log("Error deleting data "+error);
        
    }

});

  router.get ("/:id/reviews", async (req, res) => {
    try {
      const _id = req.params.id;
      const _product = await Product.findById(_id);
      
      if (!_product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const _review = await Review.find().all("productId", _id);
      
      res.status(200).json(_review);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  })
  
  router.post ("/:id/review/post", async (req, res) => {
    try {
      const { _rating, _productReview, _user } = req.body;
      console.log("name: "+ _user);
      const _productId = req.params.id;
      const _review = new Review({
        rating: parseFloat(_rating),
        review: _productReview,
        userEmail: _user,
        productId: _productId
      });
      console.log("saving review");
      
      _review.save();
  
      res.status(201).json(_review);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  })

  router.put ("/:id/rating", async (req, res) => {
    try {
      const _id = req.params.id;
      const _product = await Product.findById(_id);
      const _review = await Review.find().all("productId", _id);
      const _ratings = _review.map((i) => i.rating);
      const _avg = _ratings.reduce((sum, i) => sum + i)/_review.length;
  
      _product.rating =_avg;
      await _product.save();
      res.status(201).json(_avg);
    } catch (error) {
      res.status(500).json({ error: error.message || "Server error" });
    }
  })

module.exports = router;