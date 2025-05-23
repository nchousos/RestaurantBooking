// backend/controllers/userController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {saveRefreshTokenToDb, findUserByEmail, createUser, deleteRefreshTokenFromDb,checkRefreshTokenInDb } = require('../services/dbService');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Συμπλήρωσε όλα τα πεδία' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Λάθος credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Λάθος credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    
    await saveRefreshTokenToDb(user.user_id, refreshToken);

    res.status(200).json({
      message: 'Επιτυχής σύνδεση',
      accessToken,
      refreshToken, 
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Σφάλμα στον server', error: err.message });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Συμπλήρωσε όλα τα πεδία' });
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: 'Ο χρήστης υπάρχει ήδη' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(name, email, hashedPassword);

    res.status(201).json({ message: 'Εγγραφή επιτυχής' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Σφάλμα στον server' });
  }
};

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const valid = await checkRefreshTokenInDb(payload.userId, refreshToken);
    if (!valid) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }

  try {
    await deleteRefreshTokenFromDb(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

module.exports = { loginUser, registerUser, refreshAccessToken, logoutUser};
