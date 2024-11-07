import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import { registerUser } from '../utils/apiService'; // Adjust path as necessary

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const userData = { username, password, firstname, lastname, age };
      console.log('Registering with:', userData);
      await registerUser(userData);
      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed: ' + err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo.png')} // Ensure correct path to your logo
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>NUTRIGABAY</Text>

      {/* Form elements */}
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstname}
        placeholderTextColor="#B0B0B0" // Gray placeholder text
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
        placeholderTextColor="#B0B0B0" // Gray placeholder text
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
        placeholderTextColor="#B0B0B0" // Gray placeholder text
      />
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

      {/* Register button */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      
      {/* Error Message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Navigate to login screen */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Go to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E1', // Light cream background
    padding: 20,
  },
  logo: {
    width: 200, // Adjust logo size as needed
    height: 200,
    marginBottom: 1, // Reduced space between logo and title
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color for title
    marginBottom: 30, // Space below title
    textAlign: 'center', // Center align the title
    textTransform: 'uppercase', // Make the title uppercase for emphasis
    letterSpacing: 1.5, // Add some spacing between letters
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2, // Slight shadow below
    },
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Blur effect for the shadow
    paddingBottom: 5, // Space for the underline effect
    borderBottomWidth: 2, // Underline effect
    borderBottomColor: '#A5D6A7', // Light green underline color
  },
  
  input: {
    height: 50,
    borderColor: '#D0D0D0', // Light gray border
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF', // Light green input background
    fontSize: 16,
    width: '100%',
  },
  error: {
    color: '#FF0000', // Red for error message
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50', // Green for buttons
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15, // Space between buttons
    elevation: 3, // Shadow for elevation
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#4CAF50', // Green text for the link
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10, // Space above the link text
  },
});

export default RegisterScreen;
