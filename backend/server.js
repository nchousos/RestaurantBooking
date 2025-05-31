
//backend/server.js
require('dotenv').config();
BigInt.prototype.toJSON = function() { return this.toString(); };
const pool = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3010; 

const authRoutes = require('./src/routes/auth');
const restaurantRoutes = require('./src/routes/restaurants');
const reservationRoutes = require('./src/routes/reservations');
const userRoutes = require('./src/routes/user');

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes); 

app.use('/restaurants', restaurantRoutes);

app.use('/reservations', reservationRoutes);

app.use('/user', userRoutes); 


app.get('/users', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      
      const rows = await conn.query('SELECT user_id, name, email FROM users');
      res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    } finally {
      if (conn) conn.release();
    }
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
