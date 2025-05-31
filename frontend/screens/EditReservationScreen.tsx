import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axiosInstance from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Icons
const calendarIcon = 'https://img.icons8.com/ios-filled/50/000000/calendar.png';
const clockIcon = 'https://img.icons8.com/ios-filled/50/000000/clock.png';
const peopleIcon = 'https://img.icons8.com/ios-filled/50/000000/conference-call.png';

type Reservation = {
  reservation_id: number;
  restaurant_name: string;
  date: string;
  time: string;
  people_count: number;
  restaurant_id: number;
};
type RouteProps = RouteProp<RootStackParamList, 'EditReservation'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditReservation'>;

type Props = { route: RouteProps };

export default function EditReservationScreen({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { reservation } = route.params;
  const [date, setDate] = useState(reservation.date);
  const [time, setTime] = useState(reservation.time.slice(0,5));
  const [peopleCount, setPeopleCount] = useState(reservation.people_count.toString());
  const [availableSeats, setAvailableSeats] = useState<number | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    (async () => {
      if (!date) return;
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axiosInstance.get(
          `/restaurants/${reservation.restaurant_id}?date=${date}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAvailableSeats(res.data.available_seats);
      } catch {
        setAvailableSeats(null);
      }
    })();
  }, [date, reservation.restaurant_id]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const onConfirmDate = (picked: Date) => {
    setDate(picked.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const handleSave = async () => {
    const TIME_REGEX = /^\d{2}:\d{2}$/;
    if (!TIME_REGEX.test(time.trim())) return Alert.alert('Σφάλμα', 'Η ώρα πρέπει να είναι HH:MM');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert('Σφάλμα', 'Η ημερομηνία πρέπει να είναι YYYY-MM-DD');
    if (!peopleCount) return Alert.alert('Σφάλμα', 'Συμπλήρωσε όλα τα πεδία');

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axiosInstance.put(
        `/reservations/${reservation.reservation_id}`,
        { restaurant_id: reservation.restaurant_id, date, time: time.trim(), people_count: +peopleCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Επιτυχία', 'Η κράτηση ενημερώθηκε', [
        { text: 'OK', onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (err: any) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Απέτυχε η ενημέρωση');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Εστιατόριο</Text>
        <Text style={styles.restaurantName}>{reservation.restaurant_name}</Text>
      </View>

      <View style={styles.rowCard}>
        <Image source={{ uri: calendarIcon }} style={styles.icon} />
        <Text style={styles.infoText}>{date}</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={showDatePicker}>
          <Text style={styles.actionText}>Αλλαγή</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={onConfirmDate}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
      />

      <View style={styles.rowCard}>
        <Image source={{ uri: clockIcon }} style={styles.icon} />
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM"
          style={styles.input}
        />
      </View>

      <View style={styles.rowCard}>
        <Image source={{ uri: peopleIcon }} style={styles.icon} />
        <TextInput
          value={peopleCount}
          onChangeText={setPeopleCount}
          keyboardType="numeric"
          placeholder="Άτομα"
          style={styles.input}
        />
      </View>

      {availableSeats !== null && (
        <Text style={styles.seats}>Διαθέσιμες Θέσεις: {availableSeats}</Text>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Αποθήκευση</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9f9f9' },
  infoBox: { marginBottom: 20 },
  label: { fontSize: 16, color: '#555' },
  restaurantName: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    elevation: 2,
  },
  icon: { width: 24, height: 24, tintColor: '#007bff', marginRight: 12 },
  infoText: { flex: 1, fontSize: 14 },
  actionBtn: { backgroundColor: '#007bff', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 14 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  seats: { fontSize: 14, color: '#28a745', textAlign: 'center', marginVertical: 10 },
  saveBtn: { backgroundColor: '#007bff', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
