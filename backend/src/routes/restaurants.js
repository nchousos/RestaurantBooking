// backend/routes/restaurants.js
const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/authenticate');
BigInt.prototype.toJSON = function() { return this.toString(); };

const {
  fetchAllRestaurants,
  fetchRestaurantById,
} = require('../../controllers/restaurantController');

// GET /restaurants
router.get('/', authenticate,fetchAllRestaurants);

// GET /restaurants/:id
router.get('/:id', authenticate,fetchRestaurantById);

module.exports = router;
