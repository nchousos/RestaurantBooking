const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
const {
    createReservation,
    deleteReservation,
    updateReservation,
    getReservations
  } = require('../../controllers/reservationController');

// Create new reservation

router.post('/',           authenticate, createReservation);


router.get('/',            authenticate, getReservations);

// Delete one of the user’s reservations
router.delete('/:id',      authenticate, deleteReservation);

// Update one of the user’s reservations
router.put('/:id',         authenticate, updateReservation);

module.exports = router;