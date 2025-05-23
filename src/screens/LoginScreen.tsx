// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axiosInstance from '../api/axiosInstance';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';



type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
  };

  
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    if (!email || !password) {
        return Alert.alert('Σφάλμα', 'Συμπλήρωσε όλα τα πεδία');
      }

    try {
        const response = await axiosInstance.post('http://10.0.2.2:3010/auth/login', { email, password });
        const { accessToken,refreshToken, user } = response.data;
    
        // ←─── Store the JWT in AsyncStorage ────┐
        await AsyncStorage.setItem('userToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        // └───────────────────────────────────────┘
        

        
        Alert.alert('Επιτυχία', 'Συνδεθήκατε επιτυχώς!');
        
        navigation.replace('Home');
    } catch (error: any) {
        Alert.alert('Σφάλμα', error.response?.data?.message || 'Κάτι πήγε στραβά');
    }
    };

  return (
    <View style={styles.container}>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Κωδικός"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Σύνδεση</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Δεν έχεις λογαριασμό; Κάνε εγγραφή τώρα</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  link: { marginTop: 15, textAlign: 'center', color: '#007bff' },
});

export default LoginScreen;
