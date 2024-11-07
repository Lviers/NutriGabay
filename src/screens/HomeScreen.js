import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Linking, ScrollView, Modal, Button } from 'react-native';
import { getFilteredFoods, recordConsumption, updateProgress, getProgressForUserToday, getBmiRecord } from '../utils/apiService';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, dailyCalories: routeDailyCalories } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [foods, setFoods] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("All");
  const [bmi, setBmi] = useState(null);
  const [dailyCalories, setDailyCalories] = useState(null);
  const [firstname, setFirstname] = useState('');
  const [disclaimerShown, setDisclaimerShown] = useState(false);
  const [lowCalorieFoods, setLowCalorieFoods] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  const showDisclaimer = async () => {
    try {
      const value = await AsyncStorage.getItem('disclaimerShown');
      if (!value) {
        Alert.alert(
          'Disclaimer',
          'This app is for informational purposes only and does not constitute medical advice.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
        await AsyncStorage.setItem('disclaimerShown', 'true');
        setDisclaimerShown(true);
      }
    } catch (error) {
      console.error('Failed to check or set disclaimer:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const bmiResponse = await getBmiRecord(userId);
        setBmi(bmiResponse.bmi);
        setFirstname(bmiResponse.user.firstname);

        if (bmiResponse.recommendation?.daily_calories) {
          setDailyCalories(bmiResponse.recommendation.daily_calories);
        } else if (routeDailyCalories) {
          setDailyCalories(routeDailyCalories);
        }

        const foodsData = await getFilteredFoods(userId);
        setFoods(foodsData);

        const progressData = await getProgressForUserToday(userId);
        setProgress(progressData);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setLoading(false);
    }

    showDisclaimer();
  }, [userId]);

  const handleConfirmFood = (food) => {
    Alert.alert(
      'Confirm Consumption',
      `Are you going to eat ${food.food_name}?`,
      [
        { 
          text: 'Go to Recipe', 
          onPress: () => openRecipeLink(food.recipe_link),
          style: 'default',
        },
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => handleRecordFood(food)
        }
      ],
      { cancelable: true }
    );
  };

  const openRecipeLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Failed to open link:", err));
    } else {
      Alert.alert('No Recipe', 'No recipe link available for this food.');
    }
  };

  const handleRecordFood = async (food) => {
    try {
      const newTotalCalories = (progress?.total_calories || 0) + food.calories;

      if (newTotalCalories > dailyCalories) {
        const remainingCalories = dailyCalories - (progress?.total_calories || 0);
        const lowCalorieSuggestions = foods.filter((f) => f.calories < 20);
        setLowCalorieFoods(lowCalorieSuggestions); // Set low-calorie foods for the modal
        
        // Show calorie limit exceeded alert with suggestion button
        Alert.alert(
          'Calorie Limit Reached',
          `Adding ${food.food_name} will exceed your daily calorie limit of ${dailyCalories} kcal. Consider these options under 20 calories.`,
          [
            {
              text: 'Suggested Low-Calorie Foods',
              onPress: () => setModalVisible(true) // Show the modal with suggestions
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      if (food.filtered_id) {
        await recordConsumption(userId, food.filtered_id);
        Alert.alert('Success', `${food.food_name} has been recorded as consumed.`);

        await updateProgress(userId, food.filtered_id);
        const updatedProgress = await getProgressForUserToday(userId);
        setProgress(updatedProgress);
      } else {
        Alert.alert('Error', `Invalid filtered_id for ${food.food_name}.`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to record food or update progress: ${error.message}`);
    }
  };

  const addLowCalorieFood = (food) => {
    handleRecordFood(food);
    setModalVisible(false); // Close modal after selection
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  const totalCalories = progress?.total_calories || 0;
  const progressPercentage = dailyCalories ? ((totalCalories / dailyCalories) * 100).toFixed(1) : null;

  const filteredFoods = selectedMealType === "All"
    ? foods
    : foods.filter((food) => food.mealtype.toLowerCase() === selectedMealType.toLowerCase());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, {firstname}!</Text>  
        <Text style={styles.progressText}>
          BMI: {bmi !== null ? <Text>{bmi.toFixed(2)}</Text> : <Text>Loading...</Text>}
        </Text> 
        <Text style={styles.progressText}>
          Daily Progress: {totalCalories} / {dailyCalories ? <Text>{dailyCalories}</Text> : <Text>Not available</Text>} kcal
          {progressPercentage ? <Text> ({progressPercentage}%)</Text> : null}
        </Text>
      </View>

      <Text style={styles.sectionHeaderText}>Select Meal Type:</Text>
      <View style={styles.buttonContainer}>
        {['All', 'breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
          <TouchableOpacity
            key={meal}
            style={[styles.mealButton, selectedMealType === meal ? styles.activeButton : null]}
            onPress={() => setSelectedMealType(meal)}
          >
            <Text style={styles.buttonText}>{meal}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionHeaderText}>Your Foods:</Text>
      {filteredFoods.length > 0 ? (
        <FlatList
          data={filteredFoods}
          keyExtractor={(item, index) => item.filtered_id ? item.filtered_id.toString() : index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleConfirmFood(item)}>
              <Text style={styles.itemTitle}>{item.food_name}</Text>
              <Text style={styles.itemDetail}>Calories: {item.calories}</Text>
              <Text style={styles.itemDetail}>Carbs: {item.carbs}g | Fats: {item.fats}g | Protein: {item.protein}g</Text>
              <Text style={styles.itemDetail}>Grams: {item.grams}g | Meal: {item.mealtype}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noFoodsText}>No foods found for this meal type.</Text>
      )}

      <TouchableOpacity
        style={styles.navigationButton}
        onPress={() => navigation.navigate('FoodConsumption', {
          userId: userId,
          firstname: firstname,
          bmi: bmi,
          dailyCalories: dailyCalories,
          consumedFoods: foods,
        })}
      >
        <Text style={styles.navigationButtonText}>Go to Food Consumption</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('UserInput', { userId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal for Low-Calorie Suggestions */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Low-Calorie Suggestions</Text>
            <ScrollView style={styles.scrollView}>
              {lowCalorieFoods.map((food) => (
                <TouchableOpacity key={food.filtered_id} style={styles.modalItem} onPress={() => addLowCalorieFood(food)}>
                  <Text style={styles.modalItemText}>{food.food_name} - {food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 5,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  mealButton: {
    padding: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#000',
  },
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDetail: {
    color: '#666',
  },
  noFoodsText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  navigationButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  navigationButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  scrollView: {
    maxHeight: 200, // Limit height for scrollable list
    width: '100%',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default HomeScreen;
