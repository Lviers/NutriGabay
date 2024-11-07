import axios from 'axios';

const API_URL = 'http://192.168.1.5:8000'; 

const getRecommendations = async (bmi) => {
  try {
    const response = await axios.post(`${API_URL}/recommendation`, { bmi });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch recommendation');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
};

// Function to login a user
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

// Function to create a new BMI entry
export const createBmi = async (bmiData) => {
  try {
    const response = await axios.post(`${API_URL}/bmi`, bmiData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'BMI calculation failed');
  }
};

// Function to get a BMI record by user ID
export const getBmiRecord = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/bmi/user/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch BMI record');
  }
};

// Function to filter foods based on user preferences
export const filterFood = async (userId, answers) => {
  try {
    const response = await axios.post(`${API_URL}/filter-foods/${userId}`, answers);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to filter foods');
  }
};

// Function to get filtered foods for a user
export const getFilteredFoods = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/filtered-foods/${userId}`);
    console.log('Response from getFilteredFoods:', response.data);  // Log the full response
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered foods:', error);
    throw error;
  }
};

// Function to update weight for a user
export const updateWeight = async (userId, weight) => {
  try {
    const response = await axios.put(`${API_URL}/bmi/user/${userId}/update-weight`, { weight });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Axios error:', error);
    throw error;
  }
};

// Updated: Function to record food consumption for a user
export const recordConsumption = async (userId, filteredId) => {
  // Log the request payload
  console.log('Request Data:', {
    user_id: userId,
    filtered_id: filteredId,
  });

  try {
    const response = await axios.post(`${API_URL}/record-consumption`, {
      user_id: userId,
      filtered_id: filteredId,  // Use filtered_id here
    });

    // Log the successful response
    console.log('Record Consumption Response:', response.data);
    return response.data;

  } catch (error) {
    // Check if there's a response from the server with error details
    if (error.response) {
      // Log the full error response for debugging
      console.error('Error Response Data:', error.response.data);
      
      // Throw a custom error message based on server response
      throw new Error(error.response.data?.detail || 'Failed to record consumption');
    } else {
      // If no response from server (network or other issue)
      console.error('Network error or no response:', error.message);
      throw new Error('Network error or no response from server');
    }
  }
};

// Function to get all records for a user
export const getUserRecords = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/records/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch user records');
  }
};

// Function to update or create progress for a user
export const updateProgress = async (userId, filteredId) => {
  try {
    const response = await axios.post(`${API_URL}/progress/${userId}/update?filtered_id=${filteredId}`);
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update progress');
  }
};

// Function to get today's progress for a user
export const getProgressForUserToday = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/progress/${userId}/today`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // If no progress found for today, return null (no calories consumed yet)
      return null;
    }
    throw new Error(error.response?.data?.detail || 'Failed to fetch today\'s progress');
  }
};

// Function to get progress by date range
export const getProgressByDateRange = async (userId, startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/progress/${userId}/range?start=${startDate}&end=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress by date range:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch progress by date range');
  }
};

// Function to get all progress for a user
export const getAllProgressForUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all progress for user:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch all progress');
  }
};

// Function to get total calories per day for a user within a date range
export const getCaloriesPerDay = async (userId, startDate, endDate) => {
  try {
    const response = await axios.get(`${API_URL}/progress/${userId}/calories-per-day`, {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching calories per day:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch calorie data per day');
  }
};

// Function to add a new food consumption record for a user
export const addRecord = async (recordData) => {
  try {
    const response = await axios.post(`${API_URL}/add-record`, recordData);
    return response.data;
  } catch (error) {
    console.error('Error adding record:', error);
    throw new Error(error.response?.data?.detail || 'Failed to add record');
  }
};
export const getUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`); // Adjust the API endpoint
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch user details');
  }
};


// Export all functions in one object
export default {
  registerUser,
  loginUser,
  createBmi,
  getBmiRecord,
  getRecommendations,
  filterFood,
  getFilteredFoods,
  updateWeight,
  recordConsumption,
  getUserRecords,
  updateProgress,
  getProgressForUserToday,
  getProgressByDateRange,
  getAllProgressForUser,
  getCaloriesPerDay,
  addRecord,   
  getUserDetails,  // Newly added function
};
