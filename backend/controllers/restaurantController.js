// backend/controllers/restaurantController.js
const { getAllRestaurants, getRestaurantById } = require('../services/dbService');

const fetchAllRestaurants = async (req, res) => {
  try {
    const restaurants = await getAllRestaurants();
    res.json(restaurants);
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const fetchRestaurantById = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const restaurant = await getRestaurantById(
      req.params.id,
      date
    );

    restaurant
      ? res.json(restaurant)
      : res.status(404).json({ message: 'Restaurant not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  fetchAllRestaurants,
  fetchRestaurantById,
};
