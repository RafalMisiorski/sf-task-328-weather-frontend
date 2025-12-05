import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/Skeleton'
import { Cloud, Droplets, Thermometer, Search, Sun, CloudRain } from 'lucide-react'

const POPULAR_CITIES = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Berlin']

function getWeatherIcon(conditions: string) {
  const lower = conditions.toLowerCase()
  if (lower.includes('rain') || lower.includes('shower')) return CloudRain
  if (lower.includes('cloud')) return Cloud
  return Sun
}

export function WeatherDashboard() {
  const [city, setCity] = useState('London')
  const [searchInput, setSearchInput] = useState('')

  const { data: weather, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', city],
    queryFn: () => api.weather.get(city),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setCity(searchInput.trim())
    }
  }

  const WeatherIcon = weather ? getWeatherIcon(weather.conditions) : Sun

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Weather Dashboard</h1>
          <p className="text-blue-100">Get real-time weather information for any city</p>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for a city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-white/90 backdrop-blur border-0 shadow-lg"
            />
            <Button type="submit" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Quick City Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {POPULAR_CITIES.map((c) => (
            <Button
              key={c}
              variant={city === c ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCity(c)}
              className={city === c
                ? 'bg-white text-blue-600 hover:bg-blue-50'
                : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}
            >
              {c}
            </Button>
          ))}
        </div>

        {/* Weather Card */}
        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-12 w-24 mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-300 rounded-2xl p-8 text-center">
              <p className="text-red-700 font-medium">Failed to load weather data</p>
              <p className="text-red-600 text-sm mt-2">City not found or API unavailable</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : weather ? (
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl overflow-hidden">
              {/* City Name */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-center">
                <h2 className="text-2xl font-bold text-white">{weather.city}</h2>
                <p className="text-blue-100 capitalize">{weather.conditions}</p>
              </div>

              {/* Weather Icon & Temperature */}
              <div className="p-8 text-center">
                <WeatherIcon className="h-24 w-24 mx-auto text-blue-500 mb-4" />
                <div className="text-6xl font-bold text-gray-800">
                  {Math.round(weather.temperature)}°C
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-t">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <Thermometer className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Temperature</p>
                    <p className="text-lg font-semibold text-gray-800">{weather.temperature}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                  <Droplets className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Humidity</p>
                    <p className="text-lg font-semibold text-gray-800">{weather.humidity}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* API Status */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            Powered by Weather API | Generated by Signal Factory
          </p>
        </div>
      </div>
    </div>
  )
}
