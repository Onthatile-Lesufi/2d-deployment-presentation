import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token. Unauthorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
