import { useState } from 'react'
import { useGeolocation } from '../hooks/useGeolocation'

interface GeolocationButtonProps {
  fetchWeatherByCoords: (latitude: number, longitude: number) => Promise<void>
}

export function GeolocationButton({
  fetchWeatherByCoords,
}: GeolocationButtonProps) {
  const { error, loading: locating, getCurrentPosition } = useGeolocation()
  const [fetchingWeather, setFetchingWeather] = useState(false)
  const busy = locating || fetchingWeather

  async function handleClick() {
    const coordinates = await getCurrentPosition()
    if (!coordinates) return

    setFetchingWeather(true)
    try {
      await fetchWeatherByCoords(coordinates.latitude, coordinates.longitude)
    } finally {
      setFetchingWeather(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full rounded-lg border border-sky-400/50 px-4 py-2 font-semibold text-sky-300 transition hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locating ? 'Finding your location...' : fetchingWeather ? 'Loading weather...' : 'Use my location'}
      </button>
      {error && <p role="alert" className="mt-2 text-center text-sm text-red-400">{error}</p>}
    </div>
  )
}