// backend/controllers/reservationController.js
const { v4: uuidv4 } = require('uuid');
const {
  fetchReservations,
  fetchRestaurantById,
  getTotalPeopleAtTimeslot,
  insertReservation,
  getUserReservationsFromDb,
  deleteReservationFromDb,
  getReservationByIdForUser,
  updateReservationInDb
} = require('../services/dbService');

const TIME_REGEX = /^\d{2}:\d{2}$/;

const getReservations = async (req, res) => {
  try {
    const { restaurant_id, date, time } = req.query;
    const reservations = await fetchReservations(restaurant_id, date, time);
    res.json(reservations);
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createReservation = async (req, res) => {
  const { restaurant_id, date, time, people_count } = req.body;

  try {
    const normalizedTime = time.split(':').slice(0, 2).join(':');
    const [hours, minutes] = normalizedTime.split(':');
    

    if (!hours || !minutes || hours > 23 || minutes > 59) {
      return res.status(400).json({ message: 'Invalid time format (HH:MM)' });
    }

    if (!TIME_REGEX.test(time)) {
      return res.status(400).json({ message: 'Time must be in HH:MM format' });
    }

    const formattedTime = `${time}`;

    const restaurant = await fetchRestaurantById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const reservationTime = new Date(`1970-01-01T${time}`);
    const openingTime = new Date(`1970-01-01T${restaurant.opening_time}`);
    const closingTime = new Date(`1970-01-01T${restaurant.closing_time}`);

    if (reservationTime < openingTime || reservationTime > closingTime) {
      return res.status(400).json({
        message: `Restaurant open ${restaurant.opening_time} - ${restaurant.closing_time}`
      });
    }

    const totalPeople = await getTotalPeopleAtTimeslot(restaurant_id, date, formattedTime);
    const available = restaurant.capacity - totalPeople;

    if (available <= 0) {
      return res.status(400).json({ message: 'No available seats for this timeslot' });
    }

    if (people_count > available) {
      return res.status(400).json({
        message: `Only ${available} seats available, requested ${people_count}`
      });
    }

    const reservationUuid = uuidv4();
    const result = await insertReservation(req.user.userId, restaurant_id, date, formattedTime, people_count,reservationUuid);

    res.status(201).json({
      message: 'Reservation created',
      reservation: {
        id: result.insertId.toString(),
        restaurant_id: Number(restaurant_id),
        date,
        time,
        people_count: Number(people_count)
      }
    });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /user/reservations
const getUserReservations = async (req, res) => {
  const user_id = req.user.userId;
  console.log('🛠 getUserReservations for user_id =', user_id);
  try {
    const rows = await getUserReservationsFromDb(user_id);
    res.json(rows);
    console.log('🛠 Found reservations:', rows);
  } catch (err) {
    console.error('getUserReservations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /reservations/:id
const deleteReservation = async (req, res) => {
  const user_id = req.user.userId;
  const reservation_id = req.params.id;

  try {
    const result = await deleteReservationFromDb(reservation_id, user_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found or not yours' });
    }
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    console.error('deleteReservation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// PUT /reservations/:id
const updateReservation = async (req, res) => {
  const user_id = req.user.userId;
  const reservation_id = req.params.id;
  const { date, time, people_count, restaurant_id } = req.body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'Date must be YYYY-MM-DD' });
  }

  if (!TIME_REGEX.test(time)) {
    return res.status(400).json({ message: 'Time must be HH:MM' });
  }

  const formattedTime = `${time}:00`;
  const newPeopleCount = Number(people_count); // Ensure number

  try {
    const reservation = await getReservationByIdForUser(reservation_id, user_id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or not yours' });
    }

    const restaurant = await fetchRestaurantById(restaurant_id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const rTime = new Date(`1970-01-01T${formattedTime}`);
    const oTime = new Date(`1970-01-01T${restaurant.opening_time}`);
    const cTime = new Date(`1970-01-01T${restaurant.closing_time}`);

    if (rTime < oTime || rTime > cTime) {
      return res.status(400).json({
        message: `Restaurant open ${restaurant.opening_time}–${restaurant.closing_time}`
      });
    }

    // DEBUG: current reservation before update
    console.log('Previous Reservation:', reservation);
    console.log('Requested new people_count:', newPeopleCount);

    // Get total people for the day (INCLUDING current reservation)
    const totalPeopleIncludingCurrent = await getTotalPeopleAtTimeslot(restaurant_id, date, null); // don't exclude current
    const oldPeopleCount = reservation.people_count;
    const updatedTotal = totalPeopleIncludingCurrent - oldPeopleCount + newPeopleCount;
    const capacity = Number(restaurant.capacity);

    console.log('Restaurant capacity:', capacity);
    console.log('People already reserved (including current):', totalPeopleIncludingCurrent);
    console.log('Old people count:', oldPeopleCount);
    console.log('Extra seats needed:', newPeopleCount - oldPeopleCount);
    console.log('New total after update:', updatedTotal);

    if (updatedTotal > capacity) {
      console.log('Not enough seats. Rejecting update.');
      return res.status(400).json({
        message: `Only ${capacity - (totalPeopleIncludingCurrent - oldPeopleCount)} seats available, you requested ${newPeopleCount}`
      });
    }

    console.log('Update is valid. Proceeding with DB update...');
    await updateReservationInDb(reservation_id, date, formattedTime, newPeopleCount);

    res.json({ message: 'Reservation updated' });
  } catch (err) {
    console.error('updateReservation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



module.exports = { createReservation, getReservations, deleteReservation, updateReservation, getUserReservations };
