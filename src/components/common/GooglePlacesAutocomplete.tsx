'use client';

import React, { useEffect, useRef, useState } from 'react';
import { suppressGoogleMapsWarnings } from '@/lib/utils/suppressGoogleMapsWarnings';

/**
 * Address data structure returned by Google Places API
 */
export interface AddressData {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface GooglePlacesAutocompleteProps {
  label: string;
  value: string;
  onChange: (data: AddressData) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

/**
 * GooglePlacesAutocomplete Component
 * 
 * A reusable component that integrates Google Places Autocomplete API
 * using the new PlaceAutocompleteElement (Web Components).
 * 
 * @param label - Label for the input field
 * @param value - Current address value
 * @param onChange - Callback function when address is selected
 * @param placeholder - Placeholder text for input
 * @param error - Error message to display
 * @param required - Whether the field is required
 */
export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter address',
  error,
  required = false,
  icon,
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
    if (inputRef.current) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    // Suppress Google Maps deprecation warnings
    suppressGoogleMapsWarnings();

    // Check if Google Maps script is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script is already added, wait for it to load
      let loaded = false;
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          loaded = true;
          setIsLoaded(true);
          setIsLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout after 15 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!loaded) {
          console.error('Google Maps script timeout - Check your API key and billing');
          setIsLoading(false);
          setHasError(true);
        }
      }, 15000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }

    // Load Google Maps script with places library
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is not set');
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script'; // Add ID to identify the script

    script.onload = () => {
      // Wait a bit to ensure the API is fully initialized
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          setIsLoading(false);
        } else {
          console.error('Google Maps loaded but Places API not available');
          console.error('Make sure Places API is enabled in your Google Cloud Console');
          setIsLoading(false);
          setHasError(true);
        }
      }, 500);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script', error);
      console.error('Please verify your API key and billing status');
      setIsLoading(false);
      setHasError(true);
    };

    document.head.appendChild(script);

    // Don't remove script on unmount to prevent duplicate loading
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Add a small delay to ensure Google Maps is fully initialized
    const initTimeout = setTimeout(() => {
      try {
        // Check if Google Maps Places API is available
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('Google Maps Places API not loaded');
          setIsLoading(false);
          setHasError(true);
          return;
        }

        // Use the standard Autocomplete for now with proper configuration
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current!, {
          types: ['address'],
          fields: ['formatted_address', 'geometry', 'place_id', 'address_components'],
        });

        // Listen for place selection
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();

          if (place && place.geometry && place.geometry.location) {
            const addressData: AddressData = {
              address: place.formatted_address || '',
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              placeId: place.place_id || '',
            };

            setInputValue(addressData.address);
            if (inputRef.current) {
              inputRef.current.value = addressData.address;
            }
            onChange(addressData);
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (err) {
        console.error('Error initializing Google Places Autocomplete:', err);
        console.error('Please check:');
        console.error('1. Google Maps API key is valid');
        console.error('2. Places API is enabled in Google Cloud Console');
        console.error('3. Billing is enabled on your Google Cloud Project');
        setIsLoading(false);
        setHasError(true);
      }
    }, 300); // 300ms delay to ensure full initialization

    return () => {
      clearTimeout(initTimeout);
    };
  }, [isLoaded, onChange]);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // If user clears the input (empty string), immediately clear all address data
    if (newValue.trim() === '') {
      onChange({
        address: '',
        lat: 0,
        lng: 0,
        placeId: '',
      });
    }
  };

  const handleBlur = () => {
    // If user manually typed without selecting, save with 0 coordinates
    if (inputValue && inputValue.trim() !== '' && inputValue !== value) {
      onChange({
        address: inputValue,
        lat: 0,
        lng: 0,
        placeId: '',
      });
    }
    // If input is empty but value exists, clear it
    else if (inputValue.trim() === '' && value !== '') {
      onChange({
        address: '',
        lat: 0,
        lng: 0,
        placeId: '',
      });
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {icon && <span className="inline-block mr-1">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={inputRef}
        type="text"
        id={label}
        defaultValue={inputValue}
        onChange={handleManualChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        disabled={isLoading}
        autoComplete="off"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {isLoading && !hasError && (
        <p className="text-xs text-gray-500">Loading Google Maps...</p>
      )}
      {hasError && (
        <p className="text-xs text-yellow-600">
          ⚠️ Google Maps autocomplete unavailable. You can still enter the address manually.
        </p>
      )}
      {isLoaded && !hasError && (
        <p className="text-xs text-gray-500">
          💡 Start typing to see address suggestions
        </p>
      )}
    </div>
  );
};
