import { useState } from 'react'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface GeolocationState {
  coordinates: Coordinates | null
  error: string | null
  loading: boolean
}

const initialState: GeolocationState = {
  coordinates: null,
  error: null,
  loading: false,
}

function getErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Location permission was denied. Allow location access and try again.'
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return 'Your location is currently unavailable. Please try again.'
  }

  if (error.code === error.TIMEOUT) {
    return 'The location request timed out. Please try again.'
  }

  return 'Unable to determine your location.'
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(initialState)

  function getCurrentPosition(): Promise<Coordinates | null> {
    setState((current) => ({ ...current, loading: true, error: null }))

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser.'
      setState({ coordinates: null, error, loading: false })
      return Promise.resolve(null)
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setState({ coordinates, error: null, loading: false })
          resolve(coordinates)
        },
        (positionError) => {
          setState({
            coordinates: null,
            error: getErrorMessage(positionError),
            loading: false,
          })
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
      )
    })
  }

  return { ...state, getCurrentPosition }
}