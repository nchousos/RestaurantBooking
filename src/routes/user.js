// backend/routes/user.js
const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const { getUserReservations } = require('../../controllers/reservationController');

// /user/reservations - get all reservations of the authenticated user
router.get('/reservations', authenticate, getUserReservations);

module.exports = router;
