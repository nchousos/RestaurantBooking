import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import axiosInstance from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { RootStackParamList } from '../navigation/types';

// Icons
const calendarIcon = 'https://img.icons8.com/ios-filled/50/000000/calendar.png';
const clockIcon = 'https://img.icons8.com/ios-filled/50/000000/clock.png';

// Types
type RestaurantDetailsRoute = RouteProp<RootStackParamList, 'RestaurantDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RestaurantDetails'>;

type Props = { route: RestaurantDetailsRoute };

type Restaurant = {
  restaurant_id: number;
  name: string;
  location: string;
  description: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  available_seats: number;
};

export default function RestaurantDetails({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [peopleCount, setPeopleCount] = useState('');
  const [loading, setLoading] = useState(true);
  const [availableSeats, setAvailableSeats] = useState<number | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (picked: Date) => {
    const iso = picked.toISOString().split('T')[0];
    setDate(iso);
    hideDatePicker();
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const dateParam = date || new Date().toISOString().split('T')[0];
        const res = await axiosInstance.get(
          `/restaurants/${restaurantId}?date=${dateParam}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRestaurant(res.data);
        setAvailableSeats(res.data.available_seats);
      } catch (err) {
        Alert.alert('Σφάλμα', 'Αποτυχία φόρτωσης λεπτομερειών');
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId, date]);

  const handleReservation = async () => {
    if (!date || !time || !peopleCount) {
      return Alert.alert('Σφάλμα', 'Συμπλήρωσε όλα τα πεδία');
    }
    // Validate formats...
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axiosInstance.post(
        '/reservations',
        { restaurant_id: restaurantId, date, time, people_count: +peopleCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Επιτυχία', 'Κράτηση δημιουργήθηκε', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (err: any) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Απέτυχε η κράτηση');
    }
  };

  if (loading || !restaurant) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Περιγραφή</Text>
      <Text style={styles.description}>{restaurant.description}</Text>

      <View style={styles.rowCard}>
        <Image source={{ uri: calendarIcon }} style={styles.icon} />
        <Text style={styles.infoText}>{date || 'Επίλεξε ημερομηνία'}</Text>
        <TouchableOpacity onPress={showDatePicker} style={styles.actionBtn}>
          <Text style={styles.actionText}>Ημερολόγιο</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowCard}>
        <Image source={{ uri: clockIcon }} style={styles.icon} />
        <Text style={styles.infoText}>{`${restaurant.opening_time} - ${restaurant.closing_time}`}</Text>
      </View>

      <View style={styles.availabilityBox}>
        <Text style={styles.availableText}>Διαθέσιμες Θέσεις</Text>
        <Text style={styles.seatsNumber}>{availableSeats}</Text>
      </View>

      <Text style={styles.sectionTitle}>Κράτηση</Text>
      <TextInput
        placeholder="Ώρα (HH:MM)"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <TextInput
        placeholder="Άτομα"
        value={peopleCount}
        onChangeText={setPeopleCount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity
        style={[
          styles.reserveBtn,
          (!date || !time || !peopleCount) && styles.disabledBtn,
        ]}
        onPress={handleReservation}
        disabled={!date || !time || !peopleCount}
      >
        <Text style={styles.reserveText}>Κάνε Κράτηση</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, textAlign: 'center', marginTop: 50 },
  container: { padding: 16, backgroundColor: '#f9f9f9' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 10 },
  description: { fontSize: 14, color: '#444', lineHeight: 20 },
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
  actionBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#007bff', borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 14 },
  availabilityBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 2,
  },
  availableText: { fontSize: 14, color: '#555' },
  seatsNumber: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  disabledBtn: {
  backgroundColor: '#ccc',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 14,
    elevation: 1,
  },
  reserveBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  reserveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
