import { useState, useEffect } from 'react';

interface GeoLocationState {
  country: string | null;
  isUK: boolean;
  loading: boolean;
  error: string | null;
}

export function useGeoLocation(): GeoLocationState {
  const [location, setLocation] = useState<GeoLocationState>({
    country: null,
    isUK: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Using ipapi.co for geolocation - free for up to 1000 requests per day
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const data = await response.json();
        const country = data.country_name;
        const countryCode = data.country_code;
        
        setLocation({
          country,
          isUK: countryCode === 'GB',
          loading: false,
          error: null
        });
      } catch (error) {
        setLocation({
          country: null,
          isUK: false,
          loading: false,
          error: 'Failed to determine your location'
        });
      }
    };

    fetchLocation();
  }, []);

  return location;
}