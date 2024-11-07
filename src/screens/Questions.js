import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { filterFood } from '../utils/apiService'; // Ensure the import path is correct

const questions = [
  { id: 1, key: 'pork', text: 'Do you eat pork?', imgSrc: require('../assets/1.png') },
  { id: 2, key: 'allergic_to_milk', text: 'Do you have an allergy to milk?', imgSrc: require('../assets/1.png') },
  { id: 3, key: 'allergic_to_fish', text: 'Do you have an allergy to fish?', imgSrc: require('../assets/2.png') },
  { id: 4, key: 'allergic_to_soy', text: 'Do you have an allergy to soy?', imgSrc: require('../assets/3.png') },
  { id: 5, key: 'allergic_to_chicken', text: 'Are you allergic to chicken?', imgSrc: require('../assets/4.png') },
  { id: 6, key: 'allergic_to_mussels', text: 'Are you allergic to mussels?', imgSrc: require('../assets/5.png') },
  { id: 7, key: 'allergic_to_beef', text: 'Are you allergic to beef?', imgSrc: require('../assets/6.png') },
  { id: 8, key: 'allergic_to_shrimp', text: 'Are you allergic to shrimp?', imgSrc: require('../assets/6.png') },
];

// Ensure the feedback keys match the questions keys
const nutritionalFeedback = {
  pork: {
    yes: "As you consume pork, we'll incorporate pork-based options into your diet plan.",
    no: "Since you avoid pork, we will not include any pork-based items in your diet."
  },
  allergic_to_milk: {
    yes: "Due to your milk allergy, we will exclude all dairy products and recommend suitable alternatives.",
    no: "Awesome! You can include dairy products like milk and cheese for added calcium."
  },
  allergic_to_fish: {
    yes: "Because you're allergic to fish, we will omit all fish products from your diet.",
    no: "You can enjoy fish, which is beneficial for its omega-3 fatty acids and protein."
  },
  allergic_to_soy: {
    yes: "Since you have a soy allergy, we will eliminate soy-based foods from your meal plan.",
    no: "Soy products can be a great addition to your diet as they are high in protein."
  },
  allergic_to_chicken: {
    yes: "We will remove chicken from your diet due to your allergy.",
    no: "Chicken will be included in your plan, providing a rich source of protein."
  },
  allergic_to_mussels: {
    yes: "Mussels will be excluded from your diet plan due to your allergy.",
    no: "Including mussels can provide you with valuable omega-3 fatty acids."
  },
  allergic_to_beef: {
    yes: "Beef will not be part of your diet plan due to your allergy.",
    no: "Beef is a great addition to your diet, offering essential protein and iron."
  },
  allergic_to_shrimp: {
    yes: "Shrimp will not be part of your diet plan due to your allergy.",
    no: "Shrimp is a great addition to your diet, offering essential shrimpiness."
  }
};

const Questions = ({ navigation, route }) => {
  const { userId, bmi, firstname } = route.params; // Get params from route
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedAnswer, setMarkedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');

  const handleAnswer = (answer) => {
    const question = questions[currentQuestionIndex];
    const questionKey = question.key; // Use the defined key
    setMarkedAnswer(answer);

    // Set feedback message based on answer
    const nutritionalMessage = nutritionalFeedback[questionKey]?.[answer] || '';
    setFeedback(nutritionalMessage);

    // Save the answer, converting 'yes'/'no' to true/false for boolean fields
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: answer === 'yes',
    }));
  };

  const handleNext = async () => {
    if (markedAnswer === null) {
      Alert.alert('Warning', 'Please select an answer before proceeding.');
      return;
    }
  
    const nextIndex = currentQuestionIndex + 1;
  
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setMarkedAnswer(null);
      setFeedback('');
    } else {
      // Call filterFood API when all questions are answered
      try {
        const response = await filterFood(userId, answers); // Call backend with userId and answers
        // Navigate to HomeScreen and pass filtered foods
        navigation.navigate('HomeScreen', { userId, bmi, firstname, filteredFoods: response });
      } catch (error) {
        Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const question = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Image source={question.imgSrc} style={styles.image} />
      <Text style={styles.questionText}>{question.text}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.marker, markedAnswer === 'yes' && styles.selected]}
          onPress={() => handleAnswer('yes')}
        >
          <Text style={styles.markerText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.marker, markedAnswer === 'no' && styles.selected]}
          onPress={() => handleAnswer('no')}
        >
          <Text style={styles.markerText}>✗</Text>
        </TouchableOpacity>
      </View>

      {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  marker: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  selected: {
    backgroundColor: '#4CAF50',
  },
  markerText: {
    fontSize: 24,
  },
  feedbackText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: '#4CAF50',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default Questions;
