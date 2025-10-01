import express from 'express';
import router from  express.Router();
import { registerUser, loginUser } from '../controllers/authController';

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
