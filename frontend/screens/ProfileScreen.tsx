import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image
} from 'react-native';
import axiosInstance from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// Icons
const userIcon = 'https://img.icons8.com/ios-filled/50/000000/user-male-circle.png';
const editIcon = 'https://img.icons8.com/ios-filled/50/007bff/edit.png';
const deleteIcon = 'https://img.icons8.com/ios-filled/50/ff4444/delete-sign.png';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

type Reservation = {
  reservation_id: number;
  restaurant_name: string;
  date: string;
  time: string;
  people_count: number;
  restaurant_id: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function ProfileScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('userToken');
      const raw = await AsyncStorage.getItem('userInfo');
      if (raw) setUser(JSON.parse(raw));

      try {
        const resp = await axiosInstance.get('/user/reservations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(resp.data);
      } catch (err) {
        Alert.alert('Σφάλμα', 'Αποτυχία φόρτωσης κρατήσεων');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const deleteReservation = async (id: number) => {
    const token = await AsyncStorage.getItem('userToken');
    try {
      await axiosInstance.delete(`/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(r => r.filter(x => x.reservation_id !== id));
      Alert.alert('Επιτυχία', 'Η κράτηση διαγράφηκε');
    } catch {
      Alert.alert('Σφάλμα', 'Αποτυχία διαγραφής');
    }
  };

  const editReservation = (res: Reservation) => {
    navigation.navigate('EditReservation', { reservation: res });
  };

  const handleLogout = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    try {
      if (refreshToken) await axiosInstance.post('/auth/logout', { refreshToken });
    } catch {}
    finally {
      await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userInfo']);
      navigation.replace('Login');
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  // Render header above list
  const renderHeader = () => (
    <View style={styles.content}>
      {user && (
        <View style={styles.userBox}>
          <Image source={{ uri: userIcon }} style={styles.userIcon} />
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
      )}
      <Text style={styles.sectionTitle}>Ιστορικό Κρατήσεων</Text>
      {reservations.length === 0 && (
        <Text style={styles.noResText}>Δεν υπάρχουν κρατήσεις.</Text>
      )}
    </View>
  );

  // Render below list footer
  const renderFooter = () => (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Αποσύνδεση</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={reservations}
        keyExtractor={item => item.reservation_id.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.rcTitle}>{item.restaurant_name}</Text>
            <Text style={styles.rcDetail}>{item.date} @ {item.time}</Text>
            <Text style={styles.rcDetail}>{item.people_count} άτομα</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => editReservation(item)} style={styles.actionBtn}>
                <Image source={{ uri: editIcon }} style={styles.actionIcon} />
                <Text style={styles.actionText}>Επεξεργασία</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteReservation(item.reservation_id)} style={styles.actionBtn}>
                <Image source={{ uri: deleteIcon }} style={styles.actionIcon} />
                <Text style={[styles.actionText, styles.deleteText]}>Διαγραφή</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  userIcon: { width: 50, height: 50, marginRight: 12, tintColor: '#007bff' },
  userName: { fontSize: 20, fontWeight: '600' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  noResText: { textAlign: 'center', color: '#666' },
  listContent: { paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  rcTitle: { fontSize: 16, fontWeight: '600' },
  rcDetail: { fontSize: 14, color: '#444', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionIcon: { width: 18, height: 18, marginRight: 6 },
  actionText: { fontSize: 14, color: '#007bff' },
  deleteText: { color: '#ff4444' },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
    elevation: 2,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
