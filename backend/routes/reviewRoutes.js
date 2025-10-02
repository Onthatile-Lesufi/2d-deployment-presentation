const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Reviews");
const multer = require("multer");

router.get("/", async (req, res) => {
    try {
        const _reviews = await Review.find();
        res.status(200).json(_reviews);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;