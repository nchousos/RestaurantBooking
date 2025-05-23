// backend/routes/auth.js
const express = require('express');
const router = express.Router();

const { registerUser, loginUser, refreshAccessToken, logoutUser } = require('../../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);

module.exports = router;
