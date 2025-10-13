'use client';

import React from 'react';
import PhoneInputBase, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

/**
 * PhoneInput Component
 * 
 * A reusable phone number input component with international support
 * Uses react-phone-number-input for formatting and validation
 * 
 * @param value - Current phone number value
 * @param onChange - Callback when phone number changes
 * @param placeholder - Placeholder text
 * @param error - Error message to display
 * @param label - Label for the input
 * @param required - Whether the field is required
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter phone number',
  error,
  label = 'Phone',
  required = false,
}) => {
  // Normalize phone value - show what's saved, validate only on save
  const normalizedValue = React.useMemo(() => {
    if (!value || value.trim() === '') return undefined;
    
    // If it starts with +, check if it's valid
    if (value.startsWith('+')) {
      try {
        if (isValidPhoneNumber(value)) {
          return value; // Valid E.164 format
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Not valid but still show it
      }
    }
    
    // Show the value as is - let user see and edit it
    // react-phone-number-input will handle the formatting
    return value;
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <PhoneInputBase
        international
        defaultCountry="US"
        value={normalizedValue}
        onChange={onChange}
        className="phone-input-wrapper"
        placeholder={placeholder}
        smartCaret={false}
        limitMaxLength={false}
        countryCallingCodeEditable={false}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <style jsx global>{`
        .phone-input-wrapper {
          display: flex;
          align-items: center;
        }
        .phone-input-wrapper input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #111827;
          transition: all 0.15s ease-in-out;
        }
        .phone-input-wrapper input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .phone-input-wrapper input::placeholder {
          color: #9ca3af;
        }
        .phone-input-wrapper .PhoneInputCountry {
          margin-right: 0.5rem;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: #ffffff;
          transition: all 0.15s ease-in-out;
        }
        .phone-input-wrapper .PhoneInputCountry:hover {
          border-color: #9ca3af;
          background-color: #f9fafb;
        }
        .phone-input-wrapper .PhoneInputCountry:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

