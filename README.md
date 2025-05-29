# RestaurantBooking

Αυτό το project περιλαμβάνει:
Backend API (Node.js + Express)
Mobile App (React Native)
Βάση Δεδομένων (MariaDB/MySQL)
SQL αρχείο με τα δεδομένα (restaurant_booking.sql)


1. ΑΠΑΡΑΙΤΗΤΑ ΕΡΓΑΛΕΙΑ
Πρέπει να είναι εγκατεστημένα στον υπολογιστή:
Node.js 
MariaDB ή MySQL
Android Studio (ή Android Emulator)
Java SDK + Android SDK (για React Native)


2. ΕΙΣΑΓΩΓΗ ΒΑΣΗΣ ΔΕΔΟΜΕΝΩΝ
Στο τερματικό ή το MySQL client.

Δημιούργησε βάση:
CREATE DATABASE restaurant_booking;

Κάνε import το SQL αρχείο:
mysql -u root -p restaurant_booking < restaurant_booking.sql


3. BACKEND SETUP
Πήγαινε στον φάκελο backend:
cd backend

Εγκατέστησε τις εξαρτήσεις:
npm install

Βεβαιώσου ότι υπάρχει αρχείο .env με το εξής περιεχόμενο:
PORT=3010
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123
DB_NAME=restaurant_booking
JWT_SECRET=...
REFRESH_SECRET=...
(Τα secrets υπάρχουν ήδη στο project.)

Ξεκίνησε τον backend server:
node server.js

4. FRONTEND SETUP
Πήγαινε στον βασικό φάκελο του project:

cd RestaurantReservationApp
Εγκατέστησε τις εξαρτήσεις:
npm install

Τρέξε την εφαρμογή:
npx react-native run-android
Σε Android Emulator, τότε το 10.0.2.2 είναι σωστό και δεν χρειάζεται αλλαγή.


5. ΡΟΗ ΕΚΤΕΛΕΣΗΣ
Βεβαιώσου ότι η βάση υπάρχει και έχει εισαχθεί σωστά.

Εκτέλεσε το backend:
cd backend
node server.js

Εκτέλεσε το frontend:
cd RestaurantReservationApp
npx react-native run-android


Η εφαρμογή θα ξεκινήσει στο emulator ή στη συσκευή.


6. ΠΡΟΣΘΕΤΕΣ ΠΛΗΡΟΦΟΡΙΕΣ
Όλες οι αιτήσεις προς backend γίνονται με token (JWT).
Τα δεδομένα της βάσης περιλαμβάνουν restaurants και users.
Οι χρήστες μπορούν να κάνουν κράτηση, επεξεργασία και διαγραφή.
