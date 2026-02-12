import axios from "axios"
import axiosRetry from "axios-retry"

export const api = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 5000
})

axiosRetry(api, {
  retries: 2,
  retryCondition: (error) => {
    const method = error.config?.method?.toLowerCase()

    if (method === "delete") return false

    return axiosRetry.isNetworkOrIdempotentRequestError(error)
  }
})