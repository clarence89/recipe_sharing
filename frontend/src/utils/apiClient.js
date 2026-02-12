import axios from "axios";
import axiosRetry from 'axios-retry';
export const api = axios.create({
  baseURL: "http://localhost:4000"
})
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
    return error.response?.status >= 500 || !error.response;
  },
});
