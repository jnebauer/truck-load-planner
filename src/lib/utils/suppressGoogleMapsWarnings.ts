/**
 * Suppress Google Maps deprecation warnings in console
 * 
 * Google Maps Autocomplete API is still fully supported and will continue
 * to work for at least 12+ months. This utility suppresses the console
 * warnings about the new PlaceAutocompleteElement API.
 */
export const suppressGoogleMapsWarnings = () => {
  if (typeof window === 'undefined') return;

  // Store original console.warn
  const originalWarn = console.warn;

  // Override console.warn to filter out Google Maps deprecation warnings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    const message = args[0];
    
    // Check if it's a Google Maps deprecation warning
    if (
      typeof message === 'string' &&
      (message.includes('google.maps.places.Autocomplete') ||
       message.includes('PlaceAutocompleteElement'))
    ) {
      // Suppress this warning
      return;
    }
    
    // Call original console.warn for other warnings
    originalWarn.apply(console, args);
  };
};

