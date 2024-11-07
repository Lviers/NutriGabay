import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import { useRoute, useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { filteredFoods, userId } = route.params || { filteredFoods: [], userId: null };

  const [expandedSections, setExpandedSections] = useState({});
  const [selectedMealType, setSelectedMealType] = useState('All');




  // Toggle section expansion
  const toggleSection = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Group foods by category
  const groupByCategory = (data) => {
    return data.reduce((result, item) => {
      const { category } = item;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(item);
      return result;
    }, {});
  };

  const groupedFoods = groupByCategory(filteredFoods);
  const filteredGroupedFoods = Object.keys(groupedFoods).reduce((result, category) => {
    const filteredItems = groupedFoods[category].filter(item => 
      selectedMealType === 'All' || item.meal_type.toLowerCase() === selectedMealType.toLowerCase()
    );
    if (filteredItems.length > 0) {
      result[category] = filteredItems;
    }
    return result;
  }, {});

  // Function to handle food item selection
  const navigateToTracking = () => {
    navigation.navigate('Tracking'); // Assuming the route name for Tracking.js is 'Tracking'
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>


      <View style={styles.filterContainer}>
        <Text style={styles.header}>Filtered Food Items:</Text>
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

      {Object.keys(filteredGroupedFoods).length > 0 ? (
        Object.keys(filteredGroupedFoods).map((category) => (
          <View key={category}>
            <TouchableOpacity onPress={() => toggleSection(category)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{category}</Text>
              </View>
            </TouchableOpacity>
            {expandedSections[category] && (
              <FlatList
                data={filteredGroupedFoods[category]}
                keyExtractor={(item) => item.food_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleFoodSelection(item)}>
                    <View style={styles.item}>
                      <Text style={styles.itemText}>{item.food_name}</Text>
                      <Text>Calories: {item.calorie}</Text>
                      <Text>Grams: {item.grams}</Text>
                      <Text>Carbs: {item.carbs}g</Text>
                      <Text>Protein: {item.protein}g</Text>
                      <Text>Fats: {item.fats}g</Text>
                      <Text>Meal Type: {item.meal_type}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noFoodsText}>No foods found based on your preferences.</Text>
      )}

      {/* Button to redirect to Tracking.js */}
      <TouchableOpacity onPress={navigateToTracking} style={styles.trackingButton}>
        <Text style={styles.trackingButtonText}>Go to Tracking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  totalCaloriesText: {
    fontSize: 18,
    marginVertical: 10,
  },
  filterContainer: {
    marginVertical: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  sectionHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#FFF',
    padding: 12,
    marginVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noFoodsText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 20,
    textAlign: 'center',
  },
  trackingButton: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 5,
    marginTop: 30,
    alignItems: 'center',
  },
  trackingButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
