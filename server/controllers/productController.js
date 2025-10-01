import Product from '../models/Product';

// POST /:id/like
const likeProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  const userId = req.user._id.toString();
  const alreadyLiked = product.likes.includes(userId);
  if (alreadyLiked) {
    product.likes = product.likes.filter(id => id !== userId);
  } else {
    product.likes.push(userId);
  }
  await product.save();
  res.json(product);
};

// POST /:id/comment
const commentOnProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  const comment = {
    user: req.user._id,
    text: req.body.text,
    name: req.user.name,
    createdAt: new Date(),
  };

  product.comments.push(comment);
  await product.save();
  res.json(product);
};
