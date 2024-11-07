import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { loginUser } from '../utils/apiService';  // Adjust path as necessary
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await loginUser({ username, password });
      const userId = response.user_id; // Adjust this according to your API response
      if (response.redirect_to === 'HomeScreen') {
        navigation.navigate('HomeScreen', { userId });
      } else if (response.redirect_to === 'BMICalculator') {
        navigation.navigate('BMICalculator', { userId });
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo.png')} // Ensure correct path to your logo
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Input fields and buttons */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#B0B0B0" // Gray placeholder text
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#B0B0B0" // Gray placeholder text
      />

      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Navigate to register screen */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', // Light cream background
    padding: 20,
  },
  logo: {
    width: 200, // Adjust logo size as needed
    height: 200,
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#A5D6A7', // Light gray border
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF', // White input fields
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#4CAF50', // Green for buttons
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15, // Space between buttons
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF0000', // Red for error message
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  registerText: {
    color: '#4CAF50', // Green text for the link
    textAlign: 'center',
    marginTop: 10, // Space above the link text
  },
});

export default LoginScreen;
