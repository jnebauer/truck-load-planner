import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { VALIDATION_MESSAGES } from '@/lib/backend/constants';
import { GooglePlacesAutocomplete } from '@/components/common';
import { ImageUploadCell } from './ImageUploadCell';

interface ParsedRow {
  [key: string]: string | number | null;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

interface PreviewStepProps {
  csvData: ParsedRow[];
  editedData: ParsedRow[];
  columnMappings: ColumnMapping[];
  requiredFields: Array<{ field: string; label: string; type: string }>;
  optionalFields: Array<{ field: string; label: string; type: string }>;
  existingPallets: Set<string>;
  isCheckingPallets: boolean;
  onDataEdit: (newData: ParsedRow[]) => void;
  onResetChanges: () => void;
  onBack: () => void;
  onStartImport: () => void;
}

// Define field order to match the check-in form (outside component for performance)
const FIELD_ORDER = [
  'client_name',
  'client_email',
  'label',
  'description',
  'length_mm',
  'width_mm',
  'height_mm',
  'volume_m3',
  'weight_kg',
  'stackability',
  'top_load_rating_kg',
  'orientation_locked',
  'fragile',
  'keep_upright',
  'priority',
  'pallet_no',
  'inventory_date',
  'location_site',
  'location_aisle',
  'location_bay',
  'location_level',
  'location_notes',
  'quantity',
  'status',
  'pallet_photo',
  'label_photo',
  'racking_photo',
  'onsite_photo',
];

export default function PreviewStep({
  csvData,
  editedData,
  columnMappings,
  requiredFields,
  optionalFields,
  existingPallets,
  isCheckingPallets,
  onDataEdit,
  onResetChanges,
  onBack,
  onStartImport,
}: PreviewStepProps) {
  const dataToDisplay = editedData.length > 0 ? editedData : csvData;

  // Sort columnMappings according to form field order
  const sortedColumnMappings = useMemo(() => {
    return [...columnMappings].sort((a, b) => {
      const indexA = FIELD_ORDER.indexOf(a.dbField);
      const indexB = FIELD_ORDER.indexOf(b.dbField);

      // If both fields are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one field is in the order list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither field is in the order list, keep original order
      return 0;
    });
  }, [columnMappings]);

  const handleCellEdit = (
    rowIndex: number,
    csvColumn: string,
    value: string
  ) => {
    const newData = editedData.length > 0 ? [...editedData] : [...csvData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [csvColumn]: value,
    };
    onDataEdit(newData);
  };

  // Handle location updates with lat/lng
  const handleLocationEdit = (
    rowIndex: number,
    csvColumn: string,
    address: string,
    lat: number | null,
    lng: number | null
  ) => {
    const newData = editedData.length > 0 ? [...editedData] : [...csvData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [csvColumn]: address,
      location_latitude: lat,
      location_longitude: lng,
      location_validated: lat !== null && lng !== null ? 'true' : 'false', // Track if location was validated via Google Maps
    };
    onDataEdit(newData);
  };

  // Track duplicate values for unique fields (CSV duplicates + database existing)
  const duplicateTracker = useMemo(() => {
    const tracker = new Map<string, Set<number>>(); // field -> Set of row indices with that value

    // Fields that should be unique
    const uniqueFields = ['pallet_no'];

    uniqueFields.forEach((field) => {
      const mapping = columnMappings.find((m) => m.dbField === field);
      if (!mapping) return;

      const valueToRows = new Map<string, number[]>();

      dataToDisplay.forEach((row, rowIndex) => {
        const value = String(row[mapping.csvColumn] || '').trim();
        if (!value) return; // Skip empty values

        if (!valueToRows.has(value)) {
          valueToRows.set(value, []);
        }
        valueToRows.get(value)!.push(rowIndex);
      });

      // Store rows with duplicate values (CSV internal duplicates + database existing)
      const duplicateRows = new Set<number>();

      // 1. CSV internal duplicates
      valueToRows.forEach((rows) => {
        if (rows.length > 1) {
          rows.forEach((rowIndex) => duplicateRows.add(rowIndex));
        }
      });

      // 2. Database existing pallets
      if (field === 'pallet_no') {
        dataToDisplay.forEach((row, rowIndex) => {
          const value = String(row[mapping.csvColumn] || '').trim();
          if (value && existingPallets.has(value)) {
            duplicateRows.add(rowIndex);
          }
        });
      }

      tracker.set(field, duplicateRows);
    });

    return tracker;
  }, [dataToDisplay, columnMappings, existingPallets]);

  // Helper function to check if a specific cell has an error
  const isCellError = (rowIndex: number, dbField: string): boolean => {
    const row = dataToDisplay[rowIndex];
    const mapping = columnMappings.find((m) => m.dbField === dbField);

    if (!mapping) return false;

    const value = row[mapping.csvColumn];

    // Stackability, Status, and Boolean fields auto-correct to default values, so never show as error
    if (
      dbField === 'stackability' ||
      dbField === 'status' ||
      ['orientation_locked', 'fragile', 'keep_upright'].includes(dbField)
    ) {
      return false;
    }

    // List of required fields that must have values (status and stackability excluded as they auto-correct)
    const requiredFieldsList = [
      'client_name',
      'client_email',
      'label',
      'length_mm',
      'width_mm',
      'height_mm',
      'volume_m3',
      'weight_kg',
      'top_load_rating_kg',
      'pallet_no',
      'inventory_date',
      'location_site',
      'quantity',
    ];

    const isRequired = requiredFieldsList.includes(dbField);

    // Check if required field is empty
    if (isRequired && (!value || String(value).trim() === '')) {
      return true;
    }

    // Check for client_name minimum length validation
    if (dbField === 'client_name') {
      const clientNameValue = String(value || '').trim();
      if (clientNameValue && clientNameValue.length < 2) {
        return true;
      }
    }

    // Check for email validation
    if (dbField === 'client_email') {
      const emailValue = String(value || '').trim();
      if (emailValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
          return true;
        }
      }
    }

    // Check for numeric field validations (negative or invalid)
    const numericFields = [
      'length_mm',
      'width_mm',
      'height_mm',
      'volume_m3',
      'weight_kg',
      'top_load_rating_kg',
      'quantity',
      'priority',
    ];
    if (numericFields.includes(dbField)) {
      const stringValue = String(value || '').trim();

      // Loading Priority (priority) is OPTIONAL - empty is allowed
      // Other numeric fields are REQUIRED
      if (!stringValue) {
        // priority can be empty, others cannot
        if (dbField !== 'priority') {
          return true;
        }
        // If priority is empty, no error
        return false;
      }

      const numValue = Number(stringValue);

      // Invalid number
      if (isNaN(numValue)) {
        return true;
      }

      // Check value constraints based on field type
      // All numeric fields must be greater than 0 (> 0)
      if (numValue <= 0) {
        return true;
      }
    }

    // Check for Stackability field validation
    if (dbField === 'stackability') {
      const stackValue = String(value || '')
        .trim()
        .toLowerCase();

      // Empty stackability
      if (!stackValue) {
        return true;
      }

      // Invalid option
      const validStackOptions = [
        'stackable',
        'non_stackable',
        'top_only',
        'bottom_only',
      ];
      if (!validStackOptions.includes(stackValue)) {
        return true;
      }
    }

    // Check for Boolean field validations (Orientation Locked, Fragile, Keep Upright)
    const booleanFields = ['orientation_locked', 'fragile', 'keep_upright'];
    if (booleanFields.includes(dbField)) {
      const boolValue = String(value || '')
        .trim()
        .toUpperCase();

      // Empty or invalid boolean
      if (!boolValue || (boolValue !== 'TRUE' && boolValue !== 'FALSE')) {
        return true;
      }
    }

    // Loading Priority (priority) is now handled by the numeric fields validation above (line 195)
    // No need for separate validation here

    // Check for Inventory Date validation
    if (dbField === 'inventory_date') {
      const dateValue = String(value || '').trim();

      // Empty date
      if (!dateValue) {
        return true;
      }

      // Invalid date
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return true;
      }

      // Past date check
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      const inputDate = new Date(date);
      inputDate.setHours(0, 0, 0, 0); // Reset time to start of day

      if (inputDate < today) {
        return true; // Past date - show red border
      }
    }

    // Check for Warehouse Site validation (only check if empty)
    if (dbField === 'location_site') {
      const siteValue = String(value || '').trim();

      // Only show error if address is empty
      if (!siteValue) {
        return true;
      }

      // If address is provided, accept it (validation will be done during import)
      // This allows fuzzy matching and nearby addresses to be accepted
    }

    // Check for pallet number in database
    if (dbField === 'pallet_no') {
      const palletValue = String(value || '').trim();
      if (palletValue && existingPallets.has(palletValue)) {
        return true;
      }
    }

    // Check if field has duplicate value
    if (
      duplicateTracker.has(dbField) &&
      duplicateTracker.get(dbField)!.has(rowIndex)
    ) {
      return true;
    }

    return false;
  };

  // Validation logic
  const validationResults = useMemo(() => {
    const results = {
      missingMappings: [] as string[],
      rowErrors: [] as Array<{ row: number; errors: string[] }>,
      isValid: true,
    };

    // Check if all required fields are mapped
    requiredFields.forEach((field) => {
      const isMapped = columnMappings.some(
        (mapping) => mapping.dbField === field.field
      );
      if (!isMapped) {
        results.missingMappings.push(field.label);
        results.isValid = false;
      }
    });

    // Check each row for missing required data
    dataToDisplay.forEach((row, index) => {
      const rowErrors: string[] = [];

      // Check required fields with specific error messages (excluding numeric fields, inventory_date, location_site, and status - they are validated separately)
      const requiredFieldsToCheck = [
        {
          field: 'client_name',
          message: VALIDATION_MESSAGES.CSV_CLIENT_NAME_REQUIRED,
        },
        {
          field: 'client_email',
          message: VALIDATION_MESSAGES.CSV_CLIENT_EMAIL_REQUIRED,
        },
        {
          field: 'label',
          message: VALIDATION_MESSAGES.CSV_ITEM_LABEL_REQUIRED,
        },
        {
          field: 'pallet_no',
          message: VALIDATION_MESSAGES.CSV_PALLET_NUMBER_REQUIRED,
        },
        // stackability is validated separately with specific error messages
        // status is validated separately with auto-correction to 'in_storage'
        // location_site is validated separately below with Google Maps validation
      ];

      requiredFieldsToCheck.forEach(({ field, message }) => {
        // Find the mapping for this field
        const mapping = columnMappings.find((m) => m.dbField === field);

        if (!mapping) {
          // Field not mapped, skip validation for this field
          return;
        }

        // Get value directly from row using CSV column name
        const value = row[mapping.csvColumn];

        if (!value || String(value).trim() === '') {
          rowErrors.push(message);
        }
      });

      // Check for client_name minimum length validation
      const clientNameMapping = columnMappings.find(
        (m) => m.dbField === 'client_name'
      );
      if (clientNameMapping) {
        const clientNameValue = String(
          row[clientNameMapping.csvColumn] || ''
        ).trim();
        if (clientNameValue && clientNameValue.length < 2) {
          rowErrors.push(VALIDATION_MESSAGES.CSV_CLIENT_NAME_MIN_LENGTH);
        }
      }

      // Check for email validation
      const emailMapping = columnMappings.find(
        (m) => m.dbField === 'client_email'
      );
      if (emailMapping) {
        const emailValue = String(row[emailMapping.csvColumn] || '').trim();
        if (emailValue) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailValue)) {
            rowErrors.push(VALIDATION_MESSAGES.CSV_CLIENT_EMAIL_INVALID);
          }
        }
      }

      // Check for duplicate/existing pallet numbers
      const palletMapping = columnMappings.find(
        (m) => m.dbField === 'pallet_no'
      );
      if (palletMapping) {
        const palletValue = String(row[palletMapping.csvColumn] || '').trim();
        if (palletValue) {
          // Check if exists in database
          if (existingPallets.has(palletValue)) {
            rowErrors.push(
              `${VALIDATION_MESSAGES.CSV_PALLET_EXISTS_IN_DB}: "${palletValue}"`
            );
          }
          // Check for CSV internal duplicates
          else if (
            duplicateTracker.has('pallet_no') &&
            duplicateTracker.get('pallet_no')!.has(index)
          ) {
            rowErrors.push(
              `${VALIDATION_MESSAGES.CSV_PALLET_DUPLICATE_IN_CSV}: "${palletValue}"`
            );
          }
        }
      }

      // Validate numeric fields (Length, Width, Height, Weight, Top Load Rating, Quantity, Loading Priority)
      const numericFields = [
        {
          field: 'length_mm',
          requiredMsg: VALIDATION_MESSAGES.CSV_LENGTH_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_LENGTH_INVALID,
          positiveMsg: VALIDATION_MESSAGES.CSV_LENGTH_MUST_BE_POSITIVE,
        },
        {
          field: 'width_mm',
          requiredMsg: VALIDATION_MESSAGES.CSV_WIDTH_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_WIDTH_INVALID,
          positiveMsg: VALIDATION_MESSAGES.CSV_WIDTH_MUST_BE_POSITIVE,
        },
        {
          field: 'height_mm',
          requiredMsg: VALIDATION_MESSAGES.CSV_HEIGHT_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_HEIGHT_INVALID,
          positiveMsg: VALIDATION_MESSAGES.CSV_HEIGHT_MUST_BE_POSITIVE,
        },
        {
          field: 'volume_m3',
          requiredMsg: VALIDATION_MESSAGES.CSV_VOLUME_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_VOLUME_INVALID,
          positiveMsg: VALIDATION_MESSAGES.CSV_VOLUME_MUST_BE_POSITIVE,
        },
        {
          field: 'weight_kg',
          requiredMsg: VALIDATION_MESSAGES.CSV_WEIGHT_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_WEIGHT_INVALID,
          positiveMsg: VALIDATION_MESSAGES.CSV_WEIGHT_CANNOT_BE_NEGATIVE,
        },
        {
          field: 'top_load_rating_kg',
          requiredMsg: VALIDATION_MESSAGES.CSV_TOP_LOAD_RATING_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_TOP_LOAD_RATING_INVALID,
          positiveMsg:
            VALIDATION_MESSAGES.CSV_TOP_LOAD_RATING_CANNOT_BE_NEGATIVE,
        },
        {
          field: 'quantity',
          requiredMsg: VALIDATION_MESSAGES.CSV_QUANTITY_REQUIRED,
          invalidMsg: VALIDATION_MESSAGES.CSV_QUANTITY_INVALID,
          positiveMsg: VALIDATION_MESSAGES.CSV_QUANTITY_MUST_BE_POSITIVE,
        },
        {
          field: 'priority',
          requiredMsg: null, // OPTIONAL FIELD - no required message (Loading Priority)
          invalidMsg: VALIDATION_MESSAGES.CSV_LOADING_PRIORITY_INVALID,
          positiveMsg:
            VALIDATION_MESSAGES.CSV_LOADING_PRIORITY_MUST_BE_POSITIVE,
        },
      ];

      numericFields.forEach(
        ({ field, requiredMsg, invalidMsg, positiveMsg }) => {
          const mapping = columnMappings.find((m) => m.dbField === field);

          if (!mapping) {
            return; // Field not mapped, skip
          }

          const value = row[mapping.csvColumn];
          const stringValue = String(value || '').trim();

          // Check if empty
          if (!stringValue) {
            // If field is required (requiredMsg is not null), add error
            if (requiredMsg) {
              rowErrors.push(requiredMsg);
            }
            // For optional fields (like loading_priority), skip validation if empty
            return;
          }

          // Convert to number
          const numValue = Number(stringValue);

          // Check if valid number
          if (isNaN(numValue)) {
            rowErrors.push(invalidMsg); // Show invalid number message for strings
            return;
          }

          // Check if negative or zero
          // All numeric fields must be greater than 0 (> 0)
          if (numValue <= 0) {
            rowErrors.push(positiveMsg);
          }
        }
      );

      // Validate Stackability field - no auto-correction during render
      // Auto-correction will happen when rendering the dropdown
      const stackabilityMapping = columnMappings.find(
        (m) => m.dbField === 'stackability'
      );
      if (stackabilityMapping) {
        const stackValue = String(row[stackabilityMapping.csvColumn] || '')
          .trim()
          .toLowerCase();
        const validStackOptions = [
          'stackable',
          'non_stackable',
          'top_only',
          'bottom_only',
        ];

        // Just validate, don't auto-correct here to avoid setState during render
        // The dropdown will show 'stackable' as default for empty/invalid values
        if (!stackValue || !validStackOptions.includes(stackValue)) {
          // Mark as needing correction, but don't update state here
          // The cell rendering will handle showing the correct value
        }
      }

      // Validate Status field - no auto-correction during render
      // Auto-correction will happen when rendering the dropdown
      const statusMapping = columnMappings.find((m) => m.dbField === 'status');
      if (statusMapping) {
        const statusValue = String(row[statusMapping.csvColumn] || '')
          .trim()
          .toLowerCase();
        const validStatusOptions = [
          'in_storage',
          'reserved',
          'on_truck',
          'onsite',
          'returned',
        ];

        // Just validate, don't auto-correct here to avoid setState during render
        // The dropdown will show 'in_storage' as default for invalid values
        if (!statusValue || !validStatusOptions.includes(statusValue)) {
          // Mark as needing correction, but don't update state here
          // The cell rendering will handle showing the correct value
        }
      }

      // Validate Boolean fields - no auto-correction during render
      // Auto-correction will happen when rendering the dropdown
      // Boolean fields (Orientation Locked, Fragile, Keep Upright) auto-correct:
      // - Empty or invalid values → FALSE
      // - "TRUE" (case insensitive) → TRUE
      // - Anything else → FALSE
      const booleanFields = [
        { field: 'orientation_locked', label: 'Orientation Locked' },
        { field: 'fragile', label: 'Fragile' },
        { field: 'keep_upright', label: 'Keep Upright' },
      ];

      booleanFields.forEach(({ field }) => {
        const mapping = columnMappings.find((m) => m.dbField === field);

        if (!mapping) {
          return; // Field not mapped, skip
        }

        // No validation errors - just auto-correct to FALSE if not TRUE (case insensitive)
        // The dropdown will handle displaying the correct value
      });

      // Loading Priority (priority) validation is now handled by the shared numeric validation logic above
      // (It's included in the length_mm, width_mm, etc. validation loop)

      // Validate Inventory Date field
      const dateMapping = columnMappings.find(
        (m) => m.dbField === 'inventory_date'
      );
      if (dateMapping) {
        const dateValue = String(row[dateMapping.csvColumn] || '').trim();

        // Check if empty
        if (!dateValue) {
          rowErrors.push(VALIDATION_MESSAGES.CSV_INVENTORY_DATE_REQUIRED);
        } else {
          // Check if valid date format (YYYY-MM-DD or other common formats)
          const date = new Date(dateValue);

          // Check if valid date
          if (isNaN(date.getTime())) {
            rowErrors.push(VALIDATION_MESSAGES.CSV_INVENTORY_DATE_INVALID);
          } else {
            // Check if date is in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            const inputDate = new Date(date);
            inputDate.setHours(0, 0, 0, 0); // Reset time to start of day

            if (inputDate < today) {
              rowErrors.push(VALIDATION_MESSAGES.CSV_INVENTORY_DATE_PAST);
            }
          }
        }
      }

      // Validate Warehouse Site field (only check if empty)
      const siteMapping = columnMappings.find(
        (m) => m.dbField === 'location_site'
      );
      if (siteMapping) {
        const siteValue = String(row[siteMapping.csvColumn] || '').trim();

        // Only check if empty (required field)
        if (!siteValue) {
          rowErrors.push(VALIDATION_MESSAGES.CSV_LOCATION_SITE_REQUIRED);
        }
        // If address is provided, accept it - Google Maps geocoding will be done during import
        // This allows fuzzy matching and nearby addresses (e.g., "Delhi" will find coordinates)
      }

      if (rowErrors.length > 0) {
        results.rowErrors.push({ row: index + 1, errors: rowErrors });
        results.isValid = false;
      }
    });

    return results;
  }, [
    dataToDisplay,
    columnMappings,
    requiredFields,
    duplicateTracker,
    existingPallets,
  ]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preview & Edit Import Data
        </h2>
        <p className="text-gray-600 mb-1">
          Review and edit the data before importing. Showing all{' '}
          {csvData.length} rows with all fields
        </p>
        <p className="text-sm text-blue-600">
          💡 Click on any cell to edit its value before importing
        </p>
      </div>

      {/* Database Check Status */}
      {isCheckingPallets && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0 mt-0.5"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              {VALIDATION_MESSAGES.CHECKING_DATABASE}
            </h3>
            <p className="text-sm text-blue-700">
              {VALIDATION_MESSAGES.VERIFYING_RECORDS}
            </p>
          </div>
        </div>
      )}

      {/* Validation Status */}
      {!isCheckingPallets && (
        <>
          {validationResults.isValid ? (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  {VALIDATION_MESSAGES.VALIDATION_PASSED}!
                </h3>
                <p className="text-sm text-green-700">
                  {VALIDATION_MESSAGES.ALL_CHECKS_PASSED}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 space-y-4">
              {/* Missing Field Mappings */}
              {validationResults.missingMappings.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Missing Required Field Mappings
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        The following required fields are not mapped from your
                        CSV. Please go back and ensure your CSV has these
                        columns:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {validationResults.missingMappings.map((field, idx) => (
                          <span
                            key={idx}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Row Data Errors */}
              {validationResults.rowErrors.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        {VALIDATION_MESSAGES.VALIDATION_ERRORS_FOUND} (
                        {validationResults.rowErrors.length}{' '}
                        {VALIDATION_MESSAGES.ROWS_WITH_ERRORS})
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        <strong>🔴 Fields with red borders</strong> in the table
                        below are missing required data.{' '}
                        {VALIDATION_MESSAGES.FIX_ERRORS_BEFORE_IMPORT}
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {validationResults.rowErrors
                          .slice(0, 10)
                          .map((error, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded p-3 border border-yellow-200"
                            >
                              <span className="font-semibold text-yellow-900">
                                Row {error.row}:
                              </span>
                              <span className="text-sm text-yellow-800 ml-2">
                                {error.errors.join(', ')}
                              </span>
                            </div>
                          ))}
                        {validationResults.rowErrors.length > 10 && (
                          <p className="text-sm text-yellow-700 italic">
                            ... and {validationResults.rowErrors.length - 10}{' '}
                            more rows with errors
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700">
            {csvData.length}
          </div>
          <div className="text-sm text-blue-600">Total Rows</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {columnMappings.length}
          </div>
          <div className="text-sm text-green-600">Mapped Fields</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">
            {
              columnMappings.filter((m) =>
                requiredFields.some((f) => f.field === m.dbField)
              ).length
            }
          </div>
          <div className="text-sm text-purple-600">Required Fields</div>
        </div>
        <div
          className={`rounded-lg p-4 ${
            validationResults.isValid ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              validationResults.isValid ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {validationResults.isValid
              ? '✓'
              : validationResults.rowErrors.reduce(
                  (total, rowError) => total + rowError.errors.length,
                  0
                )}
          </div>
          <div
            className={`text-sm ${
              validationResults.isValid ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {validationResults.isValid
              ? VALIDATION_MESSAGES.VALIDATION_PASSED
              : VALIDATION_MESSAGES.VALIDATION_FAILED}
          </div>
        </div>
      </div>

      {/* Editable Preview Table - Showing ALL columns and ALL rows */}
      <div className="overflow-x-auto overflow-y-auto border border-gray-200 rounded-lg mb-6 max-h-[600px] [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-gray-100 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-corner]:bg-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 border-r border-gray-300">
                #
              </th>
              {sortedColumnMappings.map((mapping, index) => {
                const fieldDef = [...requiredFields, ...optionalFields].find(
                  (f) => f.field === mapping.dbField
                );
                const isRequired = requiredFields.some(
                  (f) => f.field === mapping.dbField
                );
                const isPhotoField = [
                  'pallet_photo',
                  'label_photo',
                  'racking_photo',
                  'onsite_photo',
                ].includes(mapping.dbField);
                return (
                  <th
                    key={index}
                    className={`py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isPhotoField
                        ? 'min-w-[85px] max-w-[85px] w-[85px] px-1 whitespace-normal leading-tight'
                        : 'min-w-[150px] px-3 whitespace-nowrap'
                    }`}
                  >
                    {fieldDef?.label || mapping.dbField}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dataToDisplay.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 font-medium sticky left-0 bg-white border-r border-gray-300">
                  {rowIndex + 1}
                </td>
                {sortedColumnMappings.map((mapping, colIndex) => {
                  const value = row[mapping.csvColumn];
                  const hasError = isCellError(rowIndex, mapping.dbField);

                  // Determine field type
                  const isStackability = mapping.dbField === 'stackability';
                  const isStatus = mapping.dbField === 'status';
                  const isBooleanField = [
                    'orientation_locked',
                    'fragile',
                    'keep_upright',
                  ].includes(mapping.dbField);
                  const isNumericField = [
                    'length_mm',
                    'width_mm',
                    'height_mm',
                    'volume_m3',
                    'weight_kg',
                    'top_load_rating_kg',
                    'priority',
                    'quantity',
                  ].includes(mapping.dbField);
                  const isInventoryDate = mapping.dbField === 'inventory_date';
                  const isLocationSite = mapping.dbField === 'location_site';
                  const isPhotoField = [
                    'pallet_photo',
                    'label_photo',
                    'racking_photo',
                    'onsite_photo',
                  ].includes(mapping.dbField);

                  // Helper function to format date for input
                  const formatDateForInput = (
                    dateValue: string | number | null | undefined
                  ): string => {
                    if (!dateValue) return '';
                    const dateStr = String(dateValue).trim();
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return dateStr;
                    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
                  };

                  return (
                    <td
                      key={colIndex}
                      className={`py-1 ${isPhotoField ? '' : 'px-1'}`}
                    >
                      {isStackability ? (
                        // Stackability dropdown with auto-correction for invalid values
                        (() => {
                          const stackValue = String(value || '')
                            .trim()
                            .toLowerCase();
                          const validStackOptions = [
                            'stackable',
                            'non_stackable',
                            'top_only',
                            'bottom_only',
                          ];
                          const displayValue = validStackOptions.includes(
                            stackValue
                          )
                            ? stackValue
                            : 'stackable';

                          return (
                            <select
                              value={displayValue}
                              onChange={(e) =>
                                handleCellEdit(
                                  rowIndex,
                                  mapping.csvColumn,
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                                hasError
                                  ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                                  : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                              }`}
                            >
                              <option value="stackable">Stackable</option>
                              <option value="non_stackable">
                                Non-Stackable
                              </option>
                              <option value="top_only">Top Only</option>
                              <option value="bottom_only">Bottom Only</option>
                            </select>
                          );
                        })()
                      ) : isStatus ? (
                        // Status dropdown with auto-correction for invalid values
                        (() => {
                          const statusValue = String(value || '')
                            .trim()
                            .toLowerCase();
                          const validStatusOptions = [
                            'in_storage',
                            'reserved',
                            'on_truck',
                            'onsite',
                            'returned',
                          ];
                          const displayValue = validStatusOptions.includes(
                            statusValue
                          )
                            ? statusValue
                            : 'in_storage';

                          return (
                            <select
                              value={displayValue}
                              onChange={(e) =>
                                handleCellEdit(
                                  rowIndex,
                                  mapping.csvColumn,
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                                hasError
                                  ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                                  : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                              }`}
                            >
                              <option value="in_storage">In Storage</option>
                              <option value="reserved">Reserved</option>
                              <option value="on_truck">On Truck</option>
                              <option value="onsite">Onsite</option>
                              <option value="returned">Returned</option>
                            </select>
                          );
                        })()
                      ) : isBooleanField ? (
                        // Boolean fields dropdown with auto-correction (case insensitive)
                        (() => {
                          const boolValue = String(value || '')
                            .trim()
                            .toUpperCase();
                          // If value is TRUE (case insensitive), show TRUE, otherwise show FALSE (default)
                          const displayValue =
                            boolValue === 'TRUE' ? 'TRUE' : 'FALSE';

                          return (
                            <select
                              value={displayValue}
                              onChange={(e) =>
                                handleCellEdit(
                                  rowIndex,
                                  mapping.csvColumn,
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                                hasError
                                  ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                                  : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                              }`}
                            >
                              <option value="TRUE">TRUE</option>
                              <option value="FALSE">FALSE</option>
                            </select>
                          );
                        })()
                      ) : isNumericField ? (
                        // Numeric fields - Number input
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={String(value || '')}
                          onChange={(e) =>
                            handleCellEdit(
                              rowIndex,
                              mapping.csvColumn,
                              e.target.value
                            )
                          }
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                          placeholder={`Enter ${mapping.dbField.replace(
                            /_/g,
                            ' '
                          )}`}
                        />
                      ) : isInventoryDate ? (
                        // Inventory Date - Date input (disabled past dates)
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={formatDateForInput(value)}
                          onChange={(e) =>
                            handleCellEdit(
                              rowIndex,
                              mapping.csvColumn,
                              e.target.value
                            )
                          }
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                        />
                      ) : isLocationSite ? (
                        // Warehouse Site - Google Maps Autocomplete
                        <div className="w-full min-w-[300px]">
                          <GooglePlacesAutocomplete
                            label=""
                            value={String(value || '')}
                            onChange={(data) => {
                              handleLocationEdit(
                                rowIndex,
                                mapping.csvColumn,
                                data.address,
                                data.lat === 0 ? null : data.lat,
                                data.lng === 0 ? null : data.lng
                              );
                            }}
                            placeholder="Search address..."
                            showHints={false}
                            error={hasError ? 'error' : undefined}
                            hideErrorText={true}
                          />
                        </div>
                      ) : isPhotoField ? (
                        // Photo URL fields - Drag & Drop Image Upload
                        <ImageUploadCell
                          value={String(value || '')}
                          onChange={(url) =>
                            handleCellEdit(rowIndex, mapping.csvColumn, url)
                          }
                          folder="inventory"
                        />
                      ) : (
                        // Regular input for all other fields
                        <input
                          type="text"
                          value={String(value || '')}
                          onChange={(e) =>
                            handleCellEdit(
                              rowIndex,
                              mapping.csvColumn,
                              e.target.value
                            )
                          }
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200'
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                          placeholder={`Enter ${mapping.csvColumn}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Back to Upload
          </button>
          {editedData.length > 0 && (
            <button
              onClick={onResetChanges}
              className="px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              Reset All Changes
            </button>
          )}
        </div>
        <button
          onClick={onStartImport}
          disabled={!validationResults.isValid || isCheckingPallets}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            validationResults.isValid && !isCheckingPallets
              ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
              : 'text-gray-400 bg-gray-200 cursor-not-allowed'
          }`}
          title={
            isCheckingPallets
              ? VALIDATION_MESSAGES.CHECKING_DATABASE
              : !validationResults.isValid
              ? VALIDATION_MESSAGES.FIX_ERRORS_INSTRUCTION
              : VALIDATION_MESSAGES.START_IMPORT_PROCESS
          }
        >
          {isCheckingPallets ? (
            <>
              <div className="inline-block animate-spin h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full"></div>
              {VALIDATION_MESSAGES.CHECKING_DATABASE}
            </>
          ) : !validationResults.isValid ? (
            <>
              <AlertCircle className="inline h-4 w-4 mr-2" />
              Cannot Import - Fix Errors First
            </>
          ) : (
            <>
              {editedData.length > 0
                ? '✓ Start Import with Edits'
                : 'Start Import'}{' '}
              ({csvData.length} rows)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
