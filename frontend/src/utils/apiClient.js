import axios from "axios"
import axiosRetry from "axios-retry"

export const api = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 5000
})

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    if (!error.response) return true
    if (error.response.status >= 500) return true
    return false
  }
})