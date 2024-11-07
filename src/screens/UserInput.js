import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { addRecord } from '../utils/apiService';  // Import the addRecord function
import { useNavigation, useRoute } from '@react-navigation/native';

// Helper function to get Manila time safely
const getManilaTime = () => {
  const now = new Date();
  const manilaTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const [month, day, year, hour, minute, second] = manilaTime.match(/\d+/g);
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;

  return isoString;
};

const UserInput = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {}; // Get userId from route params

  const [foodName, setFoodName] = useState('');
  const [type, setType] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fats, setFats] = useState('');
  const [calorie, setCalorie] = useState('');
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async () => {
    if (!foodName || !type || !carbs || !protein || !fats || !calorie || !grams || !mealType || !category) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const recordData = {
      user_id: userId,
      food_name: foodName,
      type: type,
      carbs: parseInt(carbs),
      protein: parseInt(protein),
      fats: parseInt(fats),
      calorie: parseInt(calorie),
      grams: parseInt(grams),
      meal_type: mealType,
      category: category,
      consumed_at: getManilaTime(),
    };

    try {
      await addRecord(recordData);
      Alert.alert('Success', 'Record added successfully!');
      // Pass userId when navigating back to HomeScreen
      navigation.navigate('HomeScreen', { userId });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add the record.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add a New Food Record</Text>

      {/* Input fields */}
      <TextInput
        style={styles.input}
        placeholder="Food Name"
        value={foodName}
        onChangeText={setFoodName}
      />
      <TextInput
        style={styles.input}
        placeholder="Type (e.g., Fruit, Vegetable)"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={styles.input}
        placeholder="Carbs (g)"
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Protein (g)"
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Fats (g)"
        value={fats}
        onChangeText={setFats}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Calories"
        value={calorie}
        onChangeText={setCalorie}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Grams"
        value={grams}
        onChangeText={setGrams}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Meal Type (e.g., Breakfast, Lunch)"
        value={mealType}
        onChangeText={setMealType}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g., Protein, Carb)"
        value={category}
        onChangeText={setCategory}
      />

      {/* Submit button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserInput;
