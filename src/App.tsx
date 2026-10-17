import { useState } from 'react'
import { GeolocationButton } from './components/GeolocationButton'

type ForecastDay = {
  day: string
  code: number
  maxTemp: number
  minTemp: number
}

type Weather = {
  city: string
  country: string
  temperature: number
  humidity: number
  wind: number
  code: number
  forecast: ForecastDay[]
}

function describe(code: number): string {
  if (code === 0) return '☀️ Clear sky'
  if (code <= 3) return '⛅ Partly cloudy'
  if (code <= 48) return '🌫️ Foggy'
  if (code <= 67) return '🌧️ Rain'
  if (code <= 77) return '❄️ Snow'
  if (code <= 82) return '🌦️ Heavy rain'
  return '⛈️ Thunderstorm'
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const backgroundLocation = weather
    ? `${weather.city} ${weather.country || 'landmark'}`.trim()
    : 'world skyline'

  const pageBackground = `url("https://source.unsplash.com/1600x900/?${encodeURIComponent(backgroundLocation)}")`

  async function handleSearch() {
    if (!city.trim()) return
    setLoading(true)
    setError('')
    setWeather(null)

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      )
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        setError('City not found. Please check the spelling.')
        return
      }

      const place = geoData.results[0]

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8`
      )
      const weatherData = await weatherRes.json()

      const forecast = (weatherData.daily?.time ?? []).slice(1, 8).map((date: string, index: number) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        code: weatherData.daily.weather_code[index + 1],
        maxTemp: weatherData.daily.temperature_2m_max[index + 1],
        minTemp: weatherData.daily.temperature_2m_min[index + 1],
      }))

      setWeather({
        city: place.name,
        country: place.country,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code,
        forecast,
      })
    } catch {
      setError('Something went wrong. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchWeatherByCoords(latitude: number, longitude: number) {
    setLoading(true)
    setError('')
    setWeather(null)

    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=8`
      )
      if (!weatherRes.ok) throw new Error('Weather request failed')
      const weatherData = await weatherRes.json()

      const forecast = (weatherData.daily?.time ?? []).slice(1, 8).map((date: string, index: number) => ({
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        code: weatherData.daily.weather_code[index + 1],
        maxTemp: weatherData.daily.temperature_2m_max[index + 1],
        minTemp: weatherData.daily.temperature_2m_min[index + 1],
      }))

      setWeather({
        city: 'Your location',
        country: '',
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code,
        forecast,
      })
    } catch {
      setError('Could not load weather for your location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-900 p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.74), rgba(15, 23, 42, 0.74)), ${pageBackground}`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800/85 p-6 shadow-2xl backdrop-blur-sm">
        <h1 className="mb-4 text-center text-2xl font-bold text-sky-400">
          Weather App
        </h1>

        <div className="flex gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter a city name..."
            className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-white outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-600"
          >
            Search
          </button>
        </div>

        <GeolocationButton fetchWeatherByCoords={fetchWeatherByCoords} />

        {loading && <p className="mt-6 text-center text-slate-300">Loading...</p>}
        {error && <p className="mt-6 text-center text-red-400">{error}</p>}

        {weather && (
          <div className="mt-6 text-white">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {weather.country ? `${weather.city}, ${weather.country}` : weather.city}
              </h2>
              <p className="my-2 text-6xl font-bold">{weather.temperature}°C</p>
              <p className="text-lg text-sky-300">{describe(weather.code)}</p>
              <div className="mt-4 flex justify-around text-sm text-slate-300">
                <p>💧 Humidity: {weather.humidity}%</p>
                <p>💨 Wind: {weather.wind} km/h</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-700/60 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
                7-Day Forecast
              </h3>

              <div className="space-y-2">
                {weather.forecast.map((day) => (
                  <div
                    key={`${weather.city}-${day.day}`}
                    className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 text-sm"
                  >
                    <span className="w-12 font-medium text-slate-200">{day.day}</span>
                    <span className="flex-1 text-center text-sky-300">{describe(day.code)}</span>
                    <span className="w-20 text-right text-slate-200">
                      {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App