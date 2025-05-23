// services/dbService.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get all restaurants
const getAllRestaurants = async () => {
  const rows = await pool.query(`
    SELECT 
      restaurant_id,
      name,
      location,
      description,
      capacity,
      opening_time,
      closing_time
    FROM restaurants
  `);
  return rows;
};

// Optional: Get restaurant by ID
const getRestaurantById = async (id, date) => { // Add date parameter
  const rows = await pool.query(`
    SELECT 
      r.restaurant_id,
      r.name,
      r.location,
      r.description,
      r.capacity,
      r.opening_time,
      r.closing_time,
      r.capacity - COALESCE(SUM(res.people_count), 0) AS available_seats
    FROM restaurants r
    LEFT JOIN reservations res 
      ON r.restaurant_id = res.restaurant_id
      AND res.date = ?  # Use parameterized date
    WHERE r.restaurant_id = ?
    GROUP BY r.restaurant_id
  `, [date, id]); 
  return rows[0];
};

const findUserByEmail = async (email) => {
  const users = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return users[0]; 
};

// Create new user
const createUser = async (name, email, hashedPassword) => {
  const userUuid = uuidv4();

  const result = await pool.query(
    'INSERT INTO users (name, email, password, uuid) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, userUuid]
  );
  return result;
};


// RESERVATIONS QUERIES

const fetchReservations = async (restaurant_id, date, time) => {
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];

  if (restaurant_id) {
    query += ' AND restaurant_id = ?';
    params.push(restaurant_id);
  }

  if (date) {
    const inputDate = new Date(date);
    const localDate = new Date(inputDate.getTime() - inputDate.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().split('T')[0];

    query += ' AND date = ?';
    params.push(formattedDate);
  }

  if (time) {
    query += ' AND time = ?';
    params.push(time);
  }

  return await pool.query(query, params);
};

const fetchRestaurantById = async (restaurant_id) => {
  const rows = await pool.query(
    `SELECT capacity, opening_time, closing_time 
     FROM restaurants 
     WHERE restaurant_id = ?`,
    [restaurant_id]
  );
  return rows[0];
};

const getTotalPeopleAtTimeslot = async (restaurant_id, date, excludeReservationId = null) => {
  let query = `
    SELECT SUM(people_count) AS total 
    FROM reservations 
    WHERE restaurant_id = ? AND date = ?`;

  const params = [restaurant_id, date];

  if (excludeReservationId) {
    query += ' AND reservation_id != ?';
    params.push(excludeReservationId);
  }

  const result = await pool.query(query, params);
  return result[0].total || 0;
};


const insertReservation = async (user_id, restaurant_id, date, time, people_count,uuid) => {
  return await pool.query(
    `INSERT INTO reservations (user_id, restaurant_id, date, time, people_count,uuid)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, restaurant_id, date, time, people_count,uuid]
  );
};

const getUserReservationsFromDb = async (user_id) => {
  const rows = await pool.query(
    `SELECT r.reservation_id,
            r.restaurant_id,                    
            res.name AS restaurant_name,
            r.date,
            r.time,
            r.people_count
     FROM reservations r
     JOIN restaurants res ON r.restaurant_id = res.restaurant_id
     WHERE r.user_id = ?
     ORDER BY r.date DESC, r.time DESC`,
    [user_id]
  );

  const formatToLocalDate = (dateObj) => {
    const localDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const formattedRows = rows.map(row => ({
    ...row,
    date: formatToLocalDate(row.date)
  }));

  return formattedRows;
};



const deleteReservationFromDb = async (reservation_id, user_id) => {
  return await pool.query(
    `DELETE FROM reservations WHERE reservation_id = ? AND user_id = ?`,
    [reservation_id, user_id]
  );
};

const getReservationByIdForUser = async (reservation_id, user_id) => {
  const rows = await pool.query(
    `SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?`,
    [reservation_id, user_id]
  );
  return rows[0];
};

const updateReservationInDb = async (reservation_id, date, time, people_count) => {
  return await pool.query(
    `UPDATE reservations SET date = ?, time = ?, people_count = ? WHERE reservation_id = ?`,
    [date, time, people_count, reservation_id]
  );
};

const saveRefreshTokenToDb = async (user_id, token) => {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)',
    [user_id, token]
  );
};

const checkRefreshTokenInDb = async (user_id, token) => {
  const rows = await pool.query(
    'SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ?',
    [user_id, token]
  );
  return rows.length > 0;
};

const deleteRefreshTokenFromDb = async (token) => {
  await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};


module.exports = {
  getAllRestaurants,
  getRestaurantById,
  findUserByEmail,
  createUser,
  fetchReservations,
  fetchRestaurantById,
  getTotalPeopleAtTimeslot,
  insertReservation,
  getUserReservationsFromDb,
  deleteReservationFromDb,
  getReservationByIdForUser,
  updateReservationInDb,
  saveRefreshTokenToDb,
  checkRefreshTokenInDb,
  deleteRefreshTokenFromDb
};
