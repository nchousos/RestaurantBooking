// src/App.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', { email, password });
      Alert.alert('Success', response.data.message);
    } catch (error) {
      Alert.alert('Error', error.response.data.message);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      Alert.alert('Success', response.data.message);
    } catch (error) {
      Alert.alert('Error', error.response.data.message);
    }
  };

  return (
    <View>
      <Text>Register</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
