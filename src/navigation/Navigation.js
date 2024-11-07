import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BMICalculatorScreen from '../screens/BMICalculatorScreen';  // Adjust path as necessary
import RecommendPlan from '../screens/RecommendPlan';  // Adjust path as necessary
import Questions from '../screens/Questions';
import HomeScreen from '../screens/HomeScreen';  // Adjust path as necessary
import { AnswersProvider } from '../context/AnswersContext';
import FoodConsumption from '../screens/FoodConsumptionScreen';
import UserInput from '../screens/UserInput';

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <AnswersProvider>
      <Stack.Navigator initialRouteName="Login">  
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="BMICalculator" component={BMICalculatorScreen} />
        <Stack.Screen name="RecommendPlan" component={RecommendPlan} />
        <Stack.Screen name="Questions" component={Questions} />
        <Stack.Screen name="FoodConsumption" component={FoodConsumption} />
        <Stack.Screen name="UserInput" component={UserInput} />
      </Stack.Navigator>
    </AnswersProvider>
  );
}
