/**
 * Auto-generated API client
 * Do not edit manually
 */

import axios, { AxiosInstance } from 'axios'
import * as types from '@/types'

class APIClient {
  private client: AxiosInstance

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  // Health methods
  health = {
    /**
     * Health Check
     * Check API health status
     */
    check: async (): Promise<types.HealthCheck> => {
      const url = `/health`
      const response = await this.client.get<types.HealthCheck>(url)
      return response.data
    },
  }

  // Weather methods
  weather = {
    /**
     * Get Weather
     * Get weather data for a specific city
     */
    get: async (city: string): Promise<types.WeatherData> => {
      const url = `/weather/${city}`
      const response = await this.client.get<types.WeatherData>(url)
      return response.data
    },
  }

}

export const api = new APIClient()