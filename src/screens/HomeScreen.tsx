// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image
} from 'react-native';
import axiosInstance from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Restaurant = {
  restaurant_id: number;
  name: string;
  location: string;
  description?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;



export default function HomeScreen({ navigation }: Props) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('userToken');
      try {
        const response = await axiosInstance.get('http://10.0.2.2:3010/restaurants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRestaurants(response.data);
        setFiltered(response.data);
      } catch (err) {
        console.error('Fetch restaurants error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      restaurants.filter(r =>
        r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
      )
    );
  }, [query, restaurants]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    
    <SafeAreaView style={styles.container}>
      {/* Profile button */}
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.profileBtnText}>Το Προφίλ μου</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Image
          source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/search.png' }}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Αναζήτηση..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholderTextColor="#888"
        />
      </View>

      {/* Restaurant list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.restaurant_id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.restaurant_id })}
            activeOpacity={0.8}
          >
            
            <View style={styles.cardText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, padding: 16 },
  profileBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  profileBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 2,

  },
  searchIcon: { width: 20, height: 20, tintColor: '#888', marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: { width: 80, height: 80 },
  cardText: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  location: { fontSize: 14, color: '#555', marginTop: 4 }
});
