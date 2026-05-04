import axios from 'axios';

const API_URL = '/api/activity';

export const trackActivity = async ({ type, userId, userEmail, details }) => {
  try {
    await axios.post(API_URL, {
      type,
      userId,
      userEmail,
      details
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
};

export const getActivities = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    throw error;
  }
};
