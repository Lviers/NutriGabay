import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getBmiRecord } from '../utils/apiService';  // Adjust the path based on your file structure
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, dailyCalories, filteredFoods } = route.params || {};
  const [bmiRecord, setBmiRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredGroupedFoods, setFilteredGroupedFoods] = useState({});
  const [consumedCalories, setConsumedCalories] = useState(0);

  useEffect(() => {
    Alert.alert(
      'Disclaimer',
      'This app is for informational purposes only and does not constitute medical advice. Please consult a healthcare provider for personalized dietary guidance.',
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }, []);

  useEffect(() => {
    const fetchBmiRecord = async () => {
      try {
        const record = await getBmiRecord(userId);
        setBmiRecord(record);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchBmiRecord();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const groupAndFilterFoods = (foods) => {
    const grouped = foods.reduce((result, item) => {
      const { category } = item;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(item);
      return result;
    }, {});

    const filtered = Object.keys(grouped).reduce((result, category) => {
      const filteredItems = grouped[category].filter(item =>
        (selectedMealType === 'All' || item.meal_type.toLowerCase() === selectedMealType.toLowerCase()) &&
        (selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase())
      );
      if (filteredItems.length > 0) {
        result[category] = filteredItems;
      }
      return result;
    }, {});

    return filtered;
  };

  useEffect(() => {
    if (filteredFoods) {
      const filteredFoodsData = groupAndFilterFoods(filteredFoods);
      setFilteredGroupedFoods(filteredFoodsData);
    }
  }, [filteredFoods, selectedMealType, selectedCategory]);

  const handleFoodPress = (food) => {
    Alert.alert(
      'Confirmation',
      `Are you sure you want to add ${food.food_name} to your consumed list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            if (consumedCalories + food.calorie > (dailyCalories || bmiRecord.recommendation.daily_calories)) {
              alert('You have reached your daily calorie limit!');
            } else {
              setConsumedCalories(prev => prev + food.calorie);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  if (!bmiRecord) {
    return <Text style={styles.errorText}>No BMI record found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your BMI Information</Text>
      <View style={styles.recordContainer}>
        <Text style={styles.recordText}>Hello, {bmiRecord.user.firstname}!</Text>
        <Text style={styles.recordText}>
          Daily Calories: {consumedCalories}/{dailyCalories || bmiRecord.recommendation.daily_calories}
        </Text>
      </View>

      {/* Icon Buttons */}
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('FoodConsumption')}>
          <Icon name="fastfood" size={40} color="#4CAF50" />
          <Text style={styles.iconLabel}>Food Consume</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
          <Icon name="bar-chart" size={40} color="#4CAF50" />
          <Text style={styles.iconLabel}>Track Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Meal Type Picker */}
      <View style={styles.filterContainer}>
        <Text style={styles.header}>Filter Food Items:</Text>
        <Picker
          selectedValue={selectedMealType}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedMealType(itemValue)}
        >
          <Picker.Item label="All" value="All" />
          <Picker.Item label="Breakfast" value="breakfast" />
          <Picker.Item label="Lunch" value="lunch" />
          <Picker.Item label="Dinner" value="dinner" />
          <Picker.Item label="Snack" value="snack" />
        </Picker>
      </View>

      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        <Text style={styles.header}>Categories:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={() => setSelectedCategory('Meat')} style={styles.categoryButton}>
            <Text style={styles.buttonText}>Meat</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('Seafood')} style={styles.categoryButton}>
            <Text style={styles.buttonText}>Seafood</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('Vegetables')} style={styles.categoryButton}>
            <Text style={styles.buttonText}>Vegetables</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedCategory('Kakanin')} style={styles.categoryButton}>
            <Text style={styles.buttonText}>Kakanin</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Display Filtered Foods */}
      {Object.keys(filteredGroupedFoods).length > 0 ? (
        Object.keys(filteredGroupedFoods).map((category) => (
          <View key={category}>
            <Text style={styles.sectionHeaderText}>{category}</Text>
            {/* Remove the FlatList to not display food items */}
          </View>
        ))
      ) : (
        <Text style={styles.noFoodsText}>No foods found based on your preferences.</Text>
      )}

      {/* Remove the Display Consumed Foods section */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  recordText: {
    fontSize: 18,
    marginBottom: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconLabel: {
    textAlign: 'center',
    marginTop: 5,
  },
  filterContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  noFoodsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888888',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
});

export default HomeScreen;
