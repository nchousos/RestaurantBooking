# RestaurantBooking

This project includes:
- Backend API (Node.js + Express)
- Mobile App (React Native)
- Database (MariaDB/MySQL)
- SQL file with sample data (`restaurant_booking.sql`)

---

## 1. REQUIRED TOOLS

Make sure the following are installed on your system:
- Node.js  
- MariaDB or MySQL  
- Android Studio (or Android Emulator)  
- Java SDK + Android SDK (for React Native)  

---

## 2. DATABASE SETUP

Open a terminal or your preferred MySQL client.

Create the database:
```sql
CREATE DATABASE restaurant_booking;
```
Import the SQL file:
```sql
mysql -u root -p restaurant_booking < restaurant_booking.sql
```

## 3. BACKEND SETUP

Navigate to the backend folder:
```bash
cd backend
```

Install the required dependencies:

```bash
npm install
```
Make sure you have a .env file with the following content:
```ini
PORT=3010
DB_HOST=db_host
DB_USER=db_user
DB_PASSWORD=db_password
DB_NAME=restaurant_booking
JWT_SECRET=jwt_secret
REFRESH_SECRET=refresh_secret
```
The values of the variables are already included in the project. Replace them only if necessary.

Start the backend server:

```bash
node server.js
```

## 4. FRONTEND SETUP

Navigate to the root folder of the React Native app:
```bash
cd RestaurantReservationApp
```

Install the required dependencies:

```bash
npm install
```
Run the app:
```bash
npx react-native run-android
```
If you are using an Android Emulator, the IP 10.0.2.2 correctly points to localhost, so no changes are required in the API URLs.

## 5. EXECUTION FLOW

Make sure the database has been created and the SQL file has been successfully imported.

Start the backend:
```bash
cd backend
node server.js
```

Start the frontend:

```bash
cd RestaurantReservationApp
npx react-native run-android
```
The application will launch on the emulator or your connected Android device.

## 6. ADDITIONAL INFORMATION
All requests to the backend are authenticated using JWT tokens.

The database includes:

A list of restaurants

Sample users

Users can:

Make reservations

Edit their reservations

Cancel (delete) their reservations











