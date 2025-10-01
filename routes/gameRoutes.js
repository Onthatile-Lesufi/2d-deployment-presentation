import express from 'express';
const router = express.Router();

// Dummy game result route
router.post('/result', (req, res) => {
  const { userId, success } = req.body;
  // Save to DB or log if needed
  res.json({ message: `Game result recorded for user ${userId}`, success });
});

export default router;
