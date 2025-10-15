import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { VALIDATION_MESSAGES } from '@/lib/backend/constants';

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
  existingSkus: Set<string>;
  isCheckingPallets: boolean;
  isCheckingSkus: boolean;
  onDataEdit: (newData: ParsedRow[]) => void;
  onResetChanges: () => void;
  onBack: () => void;
  onStartImport: () => void;
}

// Define field order to match the check-in form (outside component for performance)
const FIELD_ORDER = [
  'client_name', 'client_email', 'project_name',
  'label', 'sku', 'description',
  'length_mm', 'width_mm', 'height_mm', 'weight_kg',
  'stackability', 'top_load_rating_kg', 'orientation_locked', 'fragile', 'keep_upright', 'priority',
  'pallet_no', 'inventory_date',
  'location_site', 'location_aisle', 'location_bay', 'location_level', 'location_notes',
  'quantity', 'status',
  'pallet_photo_url', 'label_photo_url', 'racking_photo_url', 'onsite_photo_url'
];

export default function PreviewStep({
  csvData,
  editedData,
  columnMappings,
  requiredFields,
  optionalFields,
  existingPallets,
  existingSkus,
  isCheckingPallets,
  isCheckingSkus,
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

  const handleCellEdit = (rowIndex: number, csvColumn: string, value: string) => {
    const newData = editedData.length > 0 ? [...editedData] : [...csvData];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [csvColumn]: value
    };
    onDataEdit(newData);
  };

  // Track duplicate values for unique fields (CSV duplicates + database existing)
  const duplicateTracker = useMemo(() => {
    const tracker = new Map<string, Set<number>>(); // field -> Set of row indices with that value
    
    // Fields that should be unique
    const uniqueFields = ['pallet_no', 'sku'];
    
    uniqueFields.forEach(field => {
      const mapping = columnMappings.find(m => m.dbField === field);
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
          rows.forEach(rowIndex => duplicateRows.add(rowIndex));
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
      
      // 3. Database existing SKUs
      if (field === 'sku') {
        dataToDisplay.forEach((row, rowIndex) => {
          const value = String(row[mapping.csvColumn] || '').trim();
          if (value && existingSkus.has(value)) {
            duplicateRows.add(rowIndex);
          }
        });
      }
      
      tracker.set(field, duplicateRows);
    });
    
    return tracker;
  }, [dataToDisplay, columnMappings, existingPallets, existingSkus]);

  // Helper function to check if a specific cell has an error
  const isCellError = (rowIndex: number, dbField: string): boolean => {
    const row = dataToDisplay[rowIndex];
    const mapping = columnMappings.find(m => m.dbField === dbField);
    
    if (!mapping) return false;
    
    const value = row[mapping.csvColumn];
    
    // List of required fields that must have values
    const requiredFieldsList = [
      'client_name',
      'client_email',
      'project_name',
      'label',
      'length_mm',
      'width_mm',
      'height_mm',
      'weight_kg',
      'location_site'
    ];
    
    const isRequired = requiredFieldsList.includes(dbField);
    
    // Check if required field is empty
    if (isRequired && (!value || String(value).trim() === '')) {
      return true;
    }

    // Check for numeric field validations (negative or invalid)
    const numericFields = ['length_mm', 'width_mm', 'height_mm', 'weight_kg'];
    if (numericFields.includes(dbField)) {
      const stringValue = String(value || '').trim();
      
      // Empty numeric field
      if (!stringValue) {
        return true;
      }
      
      const numValue = Number(stringValue);
      
      // Invalid number or negative
      if (isNaN(numValue) || numValue < 0) {
        return true;
      }
    }

    // Check for Stackability field validation
    if (dbField === 'stackability') {
      const stackValue = String(value || '').trim().toLowerCase();
      
      // Empty stackability
      if (!stackValue) {
        return true;
      }
      
      // Invalid option
      const validStackOptions = ['stackable', 'non_stackable', 'top_only', 'bottom_only'];
      if (!validStackOptions.includes(stackValue)) {
        return true;
      }
    }

    // Check for Boolean field validations (Orientation Locked, Fragile, Keep Upright)
    const booleanFields = ['orientation_locked', 'fragile', 'keep_upright'];
    if (booleanFields.includes(dbField)) {
      const boolValue = String(value || '').trim().toUpperCase();
      
      // Empty or invalid boolean
      if (!boolValue || (boolValue !== 'TRUE' && boolValue !== 'FALSE')) {
        return true;
      }
    }

    // Check for Loading Priority validation
    if (dbField === 'loading_priority') {
      const priorityValue = String(value || '').trim();
      
      // Empty priority
      if (!priorityValue) {
        return true;
      }
      
      const numValue = Number(priorityValue);
      
      // Invalid number or non-positive
      if (isNaN(numValue) || numValue <= 0) {
        return true;
      }
    }

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
    }

    // Check for Warehouse Site validation
    if (dbField === 'location_site') {
      const siteValue = String(value || '').trim();
      
      // Empty or too short address
      if (!siteValue || siteValue.length < 5) {
        return true;
      }
    }
    
    // Check if field has duplicate value
    if (duplicateTracker.has(dbField) && duplicateTracker.get(dbField)!.has(rowIndex)) {
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
    requiredFields.forEach(field => {
      const isMapped = columnMappings.some(mapping => mapping.dbField === field.field);
      if (!isMapped) {
        results.missingMappings.push(field.label);
        results.isValid = false;
      }
    });

    // Check each row for missing required data
    dataToDisplay.forEach((row, index) => {
      const rowErrors: string[] = [];

      // Check required fields
      const requiredFieldsToCheck = [
        { field: 'client_name', label: 'Client Name' },
        { field: 'client_email', label: 'Client Email' },
        { field: 'project_name', label: 'Project Name' },
        { field: 'label', label: 'Item Label' },
        { field: 'length_mm', label: 'Length' },
        { field: 'width_mm', label: 'Width' },
        { field: 'height_mm', label: 'Height' },
        { field: 'weight_kg', label: 'Weight' },
        { field: 'location_site', label: 'Warehouse Site' },
      ];

      requiredFieldsToCheck.forEach(({ field, label }) => {
        // Find the mapping for this field
        const mapping = columnMappings.find(m => m.dbField === field);
        
        if (!mapping) {
          // Field not mapped, skip validation for this field
          return;
        }
        
        // Get value directly from row using CSV column name
        const value = row[mapping.csvColumn];
        
        if (!value || String(value).trim() === '') {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} ${label}`);
        }
      });

      // Check for duplicate/existing pallet numbers
      const palletMapping = columnMappings.find(m => m.dbField === 'pallet_no');
      if (palletMapping) {
        const palletValue = String(row[palletMapping.csvColumn] || '').trim();
        if (palletValue) {
          // Check if exists in database
          if (existingPallets.has(palletValue)) {
            rowErrors.push(`Pallet "${palletValue}" ${VALIDATION_MESSAGES.ALREADY_EXISTS_IN_DB}`);
          } 
          // Check for CSV internal duplicates
          else if (duplicateTracker.has('pallet_no') && duplicateTracker.get('pallet_no')!.has(index)) {
            rowErrors.push(`${VALIDATION_MESSAGES.DUPLICATE_IN_CSV} Pallet Number: "${palletValue}"`);
          }
        }
      }

      // Check for duplicate/existing SKUs
      const skuMapping = columnMappings.find(m => m.dbField === 'sku');
      if (skuMapping) {
        const skuValue = String(row[skuMapping.csvColumn] || '').trim();
        if (skuValue) {
          // Check if exists in database
          if (existingSkus.has(skuValue)) {
            rowErrors.push(`SKU "${skuValue}" ${VALIDATION_MESSAGES.ALREADY_EXISTS_IN_DB}`);
          } 
          // Check for CSV internal duplicates
          else if (duplicateTracker.has('sku') && duplicateTracker.get('sku')!.has(index)) {
            rowErrors.push(`${VALIDATION_MESSAGES.DUPLICATE_IN_CSV} SKU: "${skuValue}"`);
          }
        }
      }

      // Validate numeric fields (Length, Width, Height, Weight)
      const numericFields = [
        { field: 'length_mm', label: 'Length' },
        { field: 'width_mm', label: 'Width' },
        { field: 'height_mm', label: 'Height' },
        { field: 'weight_kg', label: 'Weight' },
      ];

      numericFields.forEach(({ field, label }) => {
        const mapping = columnMappings.find(m => m.dbField === field);
        
        if (!mapping) {
          return; // Field not mapped, skip
        }

        const value = row[mapping.csvColumn];
        const stringValue = String(value || '').trim();

        // Check if empty
        if (!stringValue) {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} ${label}`);
          return;
        }

        // Convert to number
        const numValue = Number(stringValue);

        // Check if valid number
        if (isNaN(numValue)) {
          rowErrors.push(`${label} ${VALIDATION_MESSAGES.INVALID_NUMBER}`);
          return;
        }

        // Check if negative
        if (numValue < 0) {
          rowErrors.push(`${label} ${VALIDATION_MESSAGES.NEGATIVE_VALUE}`);
        }
      });

      // Validate Stackability field
      const stackabilityMapping = columnMappings.find(m => m.dbField === 'stackability');
      if (stackabilityMapping) {
        const stackValue = String(row[stackabilityMapping.csvColumn] || '').trim().toLowerCase();
        
        // Check if empty
        if (!stackValue) {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} Stackability`);
        } else {
          // Check if valid option
          const validStackOptions = ['stackable', 'non_stackable', 'top_only', 'bottom_only'];
          if (!validStackOptions.includes(stackValue)) {
            rowErrors.push(`Stackability ${VALIDATION_MESSAGES.INVALID_OPTION} (must be: stackable, non_stackable, top_only, or bottom_only)`);
          }
        }
      }

      // Validate Boolean fields (Orientation Locked, Fragile, Keep Upright)
      const booleanFields = [
        { field: 'orientation_locked', label: 'Orientation Locked' },
        { field: 'fragile', label: 'Fragile' },
        { field: 'keep_upright', label: 'Keep Upright' },
      ];

      booleanFields.forEach(({ field, label }) => {
        const mapping = columnMappings.find(m => m.dbField === field);
        
        if (!mapping) {
          return; // Field not mapped, skip
        }

        const value = String(row[mapping.csvColumn] || '').trim().toUpperCase();

        // Check if empty
        if (!value) {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} ${label}`);
          return;
        }

        // Check if TRUE or FALSE
        if (value !== 'TRUE' && value !== 'FALSE') {
          rowErrors.push(`${label} ${VALIDATION_MESSAGES.MUST_BE_TRUE_FALSE}`);
        }
      });

      // Validate Loading Priority field
      const priorityMapping = columnMappings.find(m => m.dbField === 'loading_priority');
      if (priorityMapping) {
        const priorityValue = String(row[priorityMapping.csvColumn] || '').trim();
        
        // Check if empty
        if (!priorityValue) {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} Loading Priority`);
        } else {
          // Convert to number
          const numValue = Number(priorityValue);
          
          // Check if valid number
          if (isNaN(numValue)) {
            rowErrors.push(`Loading Priority ${VALIDATION_MESSAGES.INVALID_NUMBER}`);
          } 
          // Check if negative or zero
          else if (numValue <= 0) {
            rowErrors.push(`Loading Priority ${VALIDATION_MESSAGES.MUST_BE_POSITIVE}`);
          }
        }
      }

      // Validate Inventory Date field
      const dateMapping = columnMappings.find(m => m.dbField === 'inventory_date');
      if (dateMapping) {
        const dateValue = String(row[dateMapping.csvColumn] || '').trim();
        
        // Check if empty
        if (!dateValue) {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} Inventory Date`);
        } else {
          // Check if valid date format (YYYY-MM-DD or other common formats)
          const date = new Date(dateValue);
          
          // Check if valid date
          if (isNaN(date.getTime())) {
            rowErrors.push(`Inventory Date ${VALIDATION_MESSAGES.INVALID_DATE}`);
          }
        }
      }

      // Validate Warehouse Site field
      const siteMapping = columnMappings.find(m => m.dbField === 'location_site');
      if (siteMapping) {
        const siteValue = String(row[siteMapping.csvColumn] || '').trim();
        
        // Check if empty (required field)
        if (!siteValue) {
          rowErrors.push(`${VALIDATION_MESSAGES.MISSING_FIELD} Warehouse Site`);
        } else {
          // Check minimum length for valid address
          if (siteValue.length < 5) {
            rowErrors.push(`Warehouse Site ${VALIDATION_MESSAGES.INVALID_ADDRESS}`);
          }
        }
      }

      if (rowErrors.length > 0) {
        results.rowErrors.push({ row: index + 1, errors: rowErrors });
        results.isValid = false;
      }
    });

    return results;
  }, [dataToDisplay, columnMappings, requiredFields, duplicateTracker, existingPallets, existingSkus]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Edit Import Data</h2>
        <p className="text-gray-600 mb-1">
          Review and edit the data before importing. Showing all {csvData.length} rows with all fields
        </p>
        <p className="text-sm text-blue-600">
          💡 Click on any cell to edit its value before importing
        </p>
      </div>

      {/* Database Check Status */}
      {(isCheckingPallets || isCheckingSkus) && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full flex-shrink-0 mt-0.5"></div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">{VALIDATION_MESSAGES.CHECKING_DATABASE}</h3>
            <p className="text-sm text-blue-700">
              {VALIDATION_MESSAGES.VERIFYING_RECORDS}
            </p>
          </div>
        </div>
      )}

      {/* Validation Status */}
      {!isCheckingPallets && !isCheckingSkus && (
        <>
          {validationResults.isValid ? (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">{VALIDATION_MESSAGES.VALIDATION_PASSED}!</h3>
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
                      <h3 className="font-semibold text-red-900 mb-2">Missing Required Field Mappings</h3>
                      <p className="text-sm text-red-700 mb-3">
                        The following required fields are not mapped from your CSV. Please go back and ensure your CSV has these columns:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {validationResults.missingMappings.map((field, idx) => (
                          <span key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
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
                        {VALIDATION_MESSAGES.VALIDATION_ERRORS_FOUND} ({validationResults.rowErrors.length} {VALIDATION_MESSAGES.ROWS_WITH_ERRORS})
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        <strong>🔴 Fields with red borders</strong> in the table below are missing required data. {VALIDATION_MESSAGES.FIX_ERRORS_BEFORE_IMPORT}
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {validationResults.rowErrors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="bg-white rounded p-3 border border-yellow-200">
                            <span className="font-semibold text-yellow-900">Row {error.row}:</span>
                            <span className="text-sm text-yellow-800 ml-2">{error.errors.join(', ')}</span>
                          </div>
                        ))}
                        {validationResults.rowErrors.length > 10 && (
                          <p className="text-sm text-yellow-700 italic">
                            ... and {validationResults.rowErrors.length - 10} more rows with errors
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
          <div className="text-2xl font-bold text-blue-700">{csvData.length}</div>
          <div className="text-sm text-blue-600">Total Rows</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{columnMappings.length}</div>
          <div className="text-sm text-green-600">Mapped Fields</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-700">
            {columnMappings.filter(m => requiredFields.some(f => f.field === m.dbField)).length}
          </div>
          <div className="text-sm text-purple-600">Required Fields</div>
        </div>
        <div className={`rounded-lg p-4 ${validationResults.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-2xl font-bold ${validationResults.isValid ? 'text-green-700' : 'text-red-700'}`}>
            {validationResults.isValid ? '✓' : '✗'}
          </div>
          <div className={`text-sm ${validationResults.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validationResults.isValid ? VALIDATION_MESSAGES.VALIDATION_PASSED : VALIDATION_MESSAGES.VALIDATION_FAILED}
          </div>
        </div>
      </div>

      {/* Editable Preview Table - Showing ALL columns and ALL rows */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6 max-h-[600px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 border-r border-gray-300">
                #
              </th>
              {sortedColumnMappings.map((mapping, index) => {
                const fieldDef = [...requiredFields, ...optionalFields].find(f => f.field === mapping.dbField);
                const isRequired = requiredFields.some(f => f.field === mapping.dbField);
                return (
                  <th 
                    key={index}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]"
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
                  const isBooleanField = ['orientation_locked', 'fragile', 'keep_upright'].includes(mapping.dbField);
                  const isLoadingPriority = mapping.dbField === 'loading_priority';
                  const isInventoryDate = mapping.dbField === 'inventory_date';
                  
                  // Helper function to format date for input
                  const formatDateForInput = (dateValue: string | number | null | undefined): string => {
                    if (!dateValue) return '';
                    const dateStr = String(dateValue).trim();
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return dateStr;
                    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
                  };
                  
                  return (
                    <td 
                      key={colIndex}
                      className="px-1 py-1"
                    >
                      {isStackability ? (
                        // Stackability dropdown
                        <select
                          value={String(value || '').toLowerCase()}
                          onChange={(e) => handleCellEdit(rowIndex, mapping.csvColumn, e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError 
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200' 
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                        >
                          <option value="">Select...</option>
                          <option value="stackable">Stackable</option>
                          <option value="non_stackable">Non-Stackable</option>
                          <option value="top_only">Top Only</option>
                          <option value="bottom_only">Bottom Only</option>
                        </select>
                      ) : isBooleanField ? (
                        // Boolean fields dropdown (TRUE/FALSE)
                        <select
                          value={String(value || '').toUpperCase()}
                          onChange={(e) => handleCellEdit(rowIndex, mapping.csvColumn, e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError 
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200' 
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                        >
                          <option value="">Select...</option>
                          <option value="TRUE">TRUE</option>
                          <option value="FALSE">FALSE</option>
                        </select>
                      ) : isLoadingPriority ? (
                        // Loading Priority - Number input
                        <input
                          type="number"
                          min="1"
                          value={String(value || '')}
                          onChange={(e) => handleCellEdit(rowIndex, mapping.csvColumn, e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError 
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200' 
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                          placeholder="e.g., 1"
                        />
                      ) : isInventoryDate ? (
                        // Inventory Date - Date input
                        <input
                          type="date"
                          value={formatDateForInput(value)}
                          onChange={(e) => handleCellEdit(rowIndex, mapping.csvColumn, e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm text-gray-900 border-2 rounded focus:ring-2 transition-all ${
                            hasError 
                              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-200' 
                              : 'border-gray-200 focus:ring-blue-500 focus:border-transparent hover:border-blue-300'
                          }`}
                        />
                      ) : (
                        // Regular input for all other fields
                        <input
                          type="text"
                          value={String(value || '')}
                          onChange={(e) => handleCellEdit(rowIndex, mapping.csvColumn, e.target.value)}
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
          disabled={!validationResults.isValid || isCheckingPallets || isCheckingSkus}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            validationResults.isValid && !isCheckingPallets && !isCheckingSkus
              ? 'text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
              : 'text-gray-400 bg-gray-200 cursor-not-allowed'
          }`}
          title={
            isCheckingPallets || isCheckingSkus
              ? VALIDATION_MESSAGES.CHECKING_DATABASE 
              : !validationResults.isValid 
              ? VALIDATION_MESSAGES.FIX_ERRORS_INSTRUCTION 
              : VALIDATION_MESSAGES.START_IMPORT_PROCESS
          }
        >
          {(isCheckingPallets || isCheckingSkus) ? (
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
              {editedData.length > 0 ? '✓ Start Import with Edits' : 'Start Import'} ({csvData.length} rows)
            </>
          )}
        </button>
      </div>
    </div>
  );
}

