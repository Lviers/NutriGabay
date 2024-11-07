import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker component
import { createBmi } from '../utils/apiService'; // Adjust path as necessary
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation and useRoute

const BMICalculatorScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params; // Get user ID from route parameters
  const [height, setHeight] = useState(120); // Height in cm, starting at 120
  const [weight, setWeight] = useState(30); // Weight in kg, starting at 30
  const [bmi, setBmi] = useState(null);
  const [error, setError] = useState('');

const handleCalculateBMI = async () => {
  try {
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (isNaN(heightInMeters) || isNaN(weightInKg)) {
      throw new Error('Height and weight must be valid numbers');
    }

    const bmiData = { height: heightInMeters, weight: weightInKg, user_id: userId };
    const result = await createBmi(bmiData);
    setBmi(result.bmi);

    // Redirect to RecommendPlan after calculating BMI
    navigation.navigate('RecommendPlan', { userId: userId, bmi: result.bmi });
    
  } catch (error) {
    setError(error.message || 'Failed to calculate BMI.');
  }
};




  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Height (cm):</Text>
      <Picker
        selectedValue={height}
        style={styles.picker}
        onValueChange={(itemValue) => setHeight(itemValue)}
      >
        {[...Array(121).keys()].map((value) => (
          <Picker.Item key={value + 120} label={`${value + 120} cm`} value={value + 120} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Weight (kg):</Text>
      <Picker
        selectedValue={weight}
        style={styles.picker}
        onValueChange={(itemValue) => setWeight(itemValue)}
      >
        {[...Array(271).keys()].map((value) => (
          <Picker.Item key={value + 30} label={`${value + 30} kg`} value={value + 30} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleCalculateBMI}>
        <Text style={styles.buttonText}>Calculate BMI</Text>
      </TouchableOpacity>

      {bmi !== null && <Text style={styles.result}>Your BMI: {bmi.toFixed(2)}</Text>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7', // Light background for a clean look
    padding: 20,
  },
  label: {
    fontSize: 18,
    color: '#4CAF50', // Green color for labels
    marginBottom: 8, // Reduced margin for a minimal look
  },
  picker: {
    height: 50,
    width: 250,
    marginBottom: 20,
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF', // White background for the picker
  },
  button: {
    backgroundColor: '#81A263', // Darker shade of green for a modern look
    paddingVertical: 12, // Slightly larger padding for better touch targets
    borderRadius: 30, // Fully rounded corners for a pill-shaped button
    width: '80%', // Slightly narrower width for a balanced, centered button
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF', // White border for a clean, outlined effect
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600', // Slightly bolder for better readability
  },
  result: {
    fontSize: 20,
    color: '#4CAF50', // Green color for results
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default BMICalculatorScreen;
