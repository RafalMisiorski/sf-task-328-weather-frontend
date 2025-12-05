import { createBrowserRouter } from 'react-router-dom'
import { WeatherDashboard } from '@/pages/WeatherDashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WeatherDashboard />,
  },
])