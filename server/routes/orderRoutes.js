import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Received order:', req.body); // Add this log!

    const { name, email, address, card, items, total } = req.body;
    if (!name || !email || !address || !card || !items || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const cardLast4 = card.slice(-4);
    const order = new Order({ name, email, address, cardLast4, items, total });
    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err); // Log the error!
    res.status(500).json({ message: 'Error creating order' });
  }
});


export default router;
