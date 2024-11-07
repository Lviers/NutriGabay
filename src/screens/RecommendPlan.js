import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const RecommendPlan = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bmi, userId, firstname } = route.params;

  // Function to get the category and recommendation based on BMI
  const getCategoryMessage = () => {
    if (bmi < 18.5) {
      return { category: 'Underweight', recommendation: 'Focus on GAINING WEIGHT', color: '#FFA726' }; // Orange for underweight
    } else if (bmi <= 24.9) {
      return { category: 'Normal Weight', recommendation: 'Aim to MAINTAIN YOUR WEIGHT', color: '#66BB6A' }; // Green for normal
    } else {
      return { category: 'Overweight', recommendation: 'Consider LOSING WEIGHT', color: '#EF5350' }; // Red for overweight
    }
  };

  const { category, recommendation, color } = getCategoryMessage();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.bmiText}>Your BMI: {bmi.toFixed(2)}</Text>
        <Text style={[styles.categoryText, { color }]}>{category}</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Questions', { userId, bmi, firstname })}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background for the entire screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    padding: 25,
    borderRadius: 15,
    backgroundColor: '#F5F5F5', // Light grey background for the container
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8, // More defined shadow
    elevation: 10, // Added elevation for Android
    alignItems: 'center',
  },
  bmiText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333333', // Dark grey for better contrast
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'green',
  },
  buttonText: {
    color: '#FFFFFF', // White text for the button
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default RecommendPlan;
