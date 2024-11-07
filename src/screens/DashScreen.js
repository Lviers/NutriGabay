import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit'; // Ensure you have this package installed
import AsyncStorage from '@react-native-async-storage/async-storage'; // For fetching data
import { Dimensions } from 'react-native';

const DashScreen = () => {
  const [dailyCalories, setDailyCalories] = useState(0);
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calorieData, setCalorieData] = useState([]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const foods = await AsyncStorage.getItem('foods');
        const calorieIntake = await AsyncStorage.getItem('dailyCalories');
        const parsedFoods = foods ? JSON.parse(foods) : [];
        const parsedCalories = calorieIntake ? JSON.parse(calorieIntake) : 0;

        setRecentFoods(parsedFoods.slice(-5)); // Get the last 5 foods consumed
        setDailyCalories(parsedCalories);
        setCalorieData(parsedCalories); // Add logic to fetch actual calorie data over a period
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sample data for graph (you should replace this with your actual calorie data)
  const graphData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: calorieData.length > 0 ? calorieData : [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.subtitle}>Daily Calorie Intake: {dailyCalories} kcal</Text>

          <LineChart
            data={graphData}
            width={Dimensions.get('window').width - 30}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />

          <Text style={styles.recentText}>Recent Foods Consumed:</Text>
          <FlatList
            data={recentFoods}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.foodItem}>
                <Text style={styles.foodText}>{item.recipe_name}: {item.calories} kcal</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.noDataText}>No recent food consumed.</Text>}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  recentText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  foodItem: {
    padding: 10,
    backgroundColor: '#E0F7FA',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  foodText: {
    fontSize: 16,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default DashScreen;
