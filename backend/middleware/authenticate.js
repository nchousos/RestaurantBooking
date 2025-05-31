// backend/middleware/authenticate.js
const jwt = require('jsonwebtoken');

// Fix BigInt serialization for JSON responses
BigInt.prototype.toJSON = function() {
  return this.toString();
};

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // ✅ Set req.user and log for debugging
    req.user = {
      userId: payload.userId,
      email: payload.email
    };

    console.log('✅ Authenticated user:', req.user);

    next();
  });
}

module.exports = authenticate;
