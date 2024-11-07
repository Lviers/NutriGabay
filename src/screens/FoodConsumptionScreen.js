import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, Dimensions, TextInput, Button, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserRecords, getCaloriesPerDay, updateWeight, getBmiRecord } from '../utils/apiService'; // Import getBmiRecord
import { BarChart } from 'react-native-chart-kit';
import { Line } from 'react-native-svg';

const FoodConsumption = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { bmi: initialBmi = 0, dailyCalories: initialDailyCalories = 0, firstname = 'User', userId } = route.params || {}; 

  const [bmi, setBmi] = useState(initialBmi);  
  const [dailyCalories, setDailyCalories] = useState(initialDailyCalories);
  const [consumedRecords, setConsumedRecords] = useState([]);
  const [calorieData, setCalorieData] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [updatingWeight, setUpdatingWeight] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const records = await getUserRecords(userId);
      setConsumedRecords(records);

      const startDate = '2024-10-09';
      const endDate = '2024-10-17';

      const calorieDataResponse = await getCaloriesPerDay(userId, startDate, endDate);
      if (calorieDataResponse && calorieDataResponse.length > 0) {
        const dates = calorieDataResponse.map(item => new Date(item.date).toLocaleDateString());
        const calories = calorieDataResponse.map(item => item.total_calories);
        setDateLabels(dates);
        setCalorieData(calories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch updated BMI and daily calories after weight change
  const fetchBmiData = async () => {
    try {
      const bmiResponse = await getBmiRecord(userId);
      setBmi(bmiResponse.bmi); // Update BMI
      setDailyCalories(bmiResponse.recommendation?.daily_calories || 0); // Update daily calories
    } catch (error) {
      console.error('Error fetching BMI:', error);
      Alert.alert('Error', 'Failed to fetch updated BMI.');
    }
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'No User ID provided.');
      return;
    }
    fetchUserData();
  }, [userId]);

  // Handle weight update submission
  const handleUpdateWeight = async () => {
    if (!newWeight || isNaN(newWeight)) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }

    try {
      setUpdatingWeight(true);
      await updateWeight(userId, parseFloat(newWeight));
      Alert.alert('Success', 'Your weight has been updated.');
      setNewWeight('');

      // Fetch updated BMI and daily calories
      await fetchBmiData(); // Ensure new BMI and daily calories are fetched
    } catch (error) {
      Alert.alert('Error', 'Failed to update weight.');
    } finally {
      setUpdatingWeight(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;

  // Custom decorator to draw a line for daily calorie limit
  const renderCalorieLimitLine = (calories, width, height, chartConfig) => {
    const maxData = Math.max(...calorieData);
    const dailyCaloriesPosition = height - (dailyCalories / maxData) * height;

    return (
      <Line
        key="dailyCalorieLimit"
        x1="0"
        y1={dailyCaloriesPosition}
        x2={width}
        y2={dailyCaloriesPosition}
        stroke="red"
        strokeDasharray="5, 10"
        strokeWidth="2"
      />
    );
  };

  const renderItem = () => (
    <View>
      <Text style={styles.header}>Food Consumption</Text>

      <View style={styles.updateWeightContainer}>
        <Text style={styles.updateWeightHeader}>Update Your Weight</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your new weight (kg)"
          value={newWeight}
          keyboardType="numeric"
          onChangeText={(text) => setNewWeight(text)}
        />
        <Button
          title={updatingWeight ? 'Updating...' : 'Update Weight'}
          onPress={handleUpdateWeight}
          disabled={updatingWeight}
        />
      </View>

      <View style={styles.bmiContainer}>
        <Text style={styles.bmiText}>Name: {firstname}</Text>
        <Text style={styles.bmiText}>BMI: {bmi.toFixed(2)}</Text>
        <Text style={styles.bmiText}>Recommended Daily Calories: {dailyCalories} kcal</Text>
      </View>

      <Text style={styles.recordsHeader}>Calories Consumed from 2024-10-09 to 2024-10-17:</Text>

      {loading ? (
        <Text>Loading data...</Text>
      ) : calorieData.length > 0 ? (
        <ScrollView horizontal={true}>
          <BarChart
            data={{
              labels: dateLabels,
              datasets: [{ data: calorieData, color: () => 'rgba(75, 192, 192, 1)' }],
            }}
            width={screenWidth * 2}  // Increase width for scrollability
            height={260}
            yAxisSuffix="kcal"
            fromZero={true}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#f0f0f0',
              backgroundGradientTo: '#f0f0f0',
              decimalPlaces: 0,
              color: () => 'rgba(0, 0, 0, 0.6)',
              labelColor: () => '#000',
              style: { borderRadius: 16 },
              propsForLabels: {
                fontSize: 12,
              },
              // Integrate the decorator function to draw the calorie limit line
              decorator: () => renderCalorieLimitLine(dailyCalories, screenWidth * 2, 260, this.chartConfig),
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
            verticalLabelRotation={45}
          />
        </ScrollView>
      ) : (
        <Text>No calorie data available for the specified date range.</Text>
      )}

      <Text style={styles.recordsHeader}>Your Consumed Records:</Text>
    </View>
  );

  return (
    <FlatList
      data={consumedRecords}
      ListHeaderComponent={renderItem}
      keyExtractor={(item) => item.record_id.toString()}
      renderItem={({ item }) => (
        <View style={styles.recordItem}>
          <Text style={styles.recordText}>Food: {item.food_name}</Text>
          <Text style={styles.recordText}>Calories: {item.calorie}</Text>
          <Text style={styles.recordText}>Carbs: {item.carbs}g | Fats: {item.fats}g | Protein: {item.protein}g</Text>
          <Text style={styles.recordText}>Consumed on: {new Date(item.consumed_at).toLocaleDateString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.noRecordsText}>No records found for this user.</Text>}
      contentContainerStyle={styles.scrollContainer}
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  updateWeightContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
  },
  updateWeightHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  bmiContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
  },
  bmiText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  recordsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  recordItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  recordText: {
    fontSize: 14,
    color: '#666',
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

export default FoodConsumption;
 