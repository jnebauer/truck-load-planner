// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/lib/backend/constants';
import Papa, { ParseResult } from 'papaparse';

// ============================================================================
// TYPES
// ============================================================================
interface ParsedRow {
  [key: string]: string | number | null;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

interface ImportResults {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface FieldDefinition {
  field: string;
  label: string;
  type: string;
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing CSV import functionality
 * Handles file upload, validation, column mapping, and bulk import
 * @returns Object with import data, loading states, and handler functions
 */
export function useImport(requiredFields: FieldDefinition[], optionalFields: FieldDefinition[]) {
  const router = useRouter();
  const { hasPermission, authenticatedFetch } = useAuth();
  
  // Step management
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  
  // Data state
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [editedData, setEditedData] = useState<ParsedRow[]>([]);
  
  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingPallets, setIsCheckingPallets] = useState(false);
  const [isCheckingSkus, setIsCheckingSkus] = useState(false);
  
  // Validation state
  const [existingPallets, setExistingPallets] = useState<Set<string>>(new Set());
  const [existingSkus, setExistingSkus] = useState<Set<string>>(new Set());
  
  // Import progress (0-100)
  const [importProgress, setImportProgress] = useState(0);
  
  // Import results
  const [importResults, setImportResults] = useState<ImportResults>({
    success: 0,
    failed: 0,
    errors: [],
  });

  /**
   * Parse CSV file and auto-map columns
   */
  const parseCSV = useCallback(async (file: File) => {
    try {
      setIsUploading(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<ParsedRow>) => {
          const data = results.data as ParsedRow[];
          const headers = results.meta.fields || [];

          setCsvData(data);
          setCsvHeaders(headers);

          // Auto-map columns
          const autoMappings: ColumnMapping[] = [];
          const mappedFields = new Set<string>(); // Track already mapped fields to prevent duplicates

          headers.forEach((header: string) => {
            const normalizedHeader = header.toLowerCase().trim();
            // Remove special characters and spaces, trim trailing underscores
            const cleanHeader = normalizedHeader
              .replace(/[^a-z0-9]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

            // Check required fields first - try exact label match first
            const requiredMatch = requiredFields.find((field) => {
              // Skip if already mapped
              if (mappedFields.has(field.field)) return false;
              
              const fieldLabel = field.label.toLowerCase();
              const fieldName = field.field.toLowerCase();
              const cleanFieldName = fieldName
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
              
              // Exact label match (case-insensitive)
              if (normalizedHeader === fieldLabel) return true;
              // Exact field name match
              if (cleanHeader === cleanFieldName) return true;
              // Field name is contained in header
              if (cleanHeader.includes(cleanFieldName) && cleanFieldName.length > 3) return true;
              // Label is contained in header  
              if (normalizedHeader.includes(fieldLabel) && fieldLabel.length > 3) return true;
              
              return false;
            });

            if (requiredMatch) {
              autoMappings.push({ csvColumn: header, dbField: requiredMatch.field });
              mappedFields.add(requiredMatch.field); // Mark as mapped
              return;
            }

            // Check optional fields
            const optionalMatch = optionalFields.find((field) => {
              // Skip if already mapped
              if (mappedFields.has(field.field)) return false;
              
              const fieldLabel = field.label.toLowerCase();
              const fieldName = field.field.toLowerCase();
              const cleanFieldName = fieldName
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
              
              // Exact label match (case-insensitive)
              if (normalizedHeader === fieldLabel) return true;
              // Exact field name match
              if (cleanHeader === cleanFieldName) return true;
              // Field name is contained in header
              if (cleanHeader.includes(cleanFieldName) && cleanFieldName.length > 3) return true;
              // Label is contained in header
              if (normalizedHeader.includes(fieldLabel) && fieldLabel.length > 3) return true;
              
              return false;
            });

            if (optionalMatch) {
              autoMappings.push({ csvColumn: header, dbField: optionalMatch.field });
              mappedFields.add(optionalMatch.field); // Mark as mapped
            }
          });

          setColumnMappings(autoMappings);
          
          // Debug: Log auto-mapping results
          console.log('🎯 Auto-mapped columns:', autoMappings);
          console.log('📄 CSV Headers:', headers);
          console.log('📊 First data row:', data[0]);
          
          showToast.success(`${TOAST_MESSAGES.SUCCESS.CSV_PARSED} Loaded ${data.length} rows with ${headers.length} columns`);
          setStep('preview');
        },
        error: (error: Error) => {
          console.error('CSV parsing error:', error);
          showToast.error(TOAST_MESSAGES.ERROR.CSV_PARSE_ERROR);
        },
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      showToast.error(TOAST_MESSAGES.ERROR.CSV_PARSE_ERROR);
    } finally {
      setIsUploading(false);
    }
  }, [requiredFields, optionalFields]);

  /**
   * Check database for existing pallet numbers when data or mappings change
   */
  useEffect(() => {
    const checkExistingPallets = async () => {
      // Only check when on preview step
      if (step !== 'preview') {
        return;
      }

      // Get all pallet numbers from CSV
      const palletMapping = columnMappings.find(m => m.dbField === 'pallet_no');
      if (!palletMapping) {
        setExistingPallets(new Set());
        return;
      }

      const dataToCheck = editedData.length > 0 ? editedData : csvData;
      const palletNumbers = dataToCheck
        .map(row => String(row[palletMapping.csvColumn] || '').trim())
        .filter(pallet => pallet !== '');

      if (palletNumbers.length === 0) {
        setExistingPallets(new Set());
        return;
      }

      setIsCheckingPallets(true);

      try {
        const response = await authenticatedFetch('/api/dashboard/inventory/check-pallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pallet_numbers: palletNumbers }),
        });

        if (response.ok) {
          const data = await response.json();
          setExistingPallets(new Set(data.existing_pallets || []));
        } else {
          console.error('Failed to check pallet numbers');
          setExistingPallets(new Set());
        }
      } catch (error) {
        console.error('Error checking pallet numbers:', error);
        setExistingPallets(new Set());
      } finally {
        setIsCheckingPallets(false);
      }
    };

    checkExistingPallets();
  }, [step, csvData, editedData, columnMappings, authenticatedFetch]);

  /**
   * Check for existing SKUs in database
   */
  useEffect(() => {
    const checkExistingSkus = async () => {
      if (step !== 'preview') {
        return;
      }

      // Get all SKUs from CSV
      const skuMapping = columnMappings.find(m => m.dbField === 'sku');
      if (!skuMapping) {
        setExistingSkus(new Set());
        return;
      }

      const dataToCheck = editedData.length > 0 ? editedData : csvData;
      const skus = dataToCheck
        .map(row => String(row[skuMapping.csvColumn] || '').trim())
        .filter(sku => sku !== '');

      if (skus.length === 0) {
        setExistingSkus(new Set());
        return;
      }

      setIsCheckingSkus(true);

      try {
        const response = await authenticatedFetch('/api/dashboard/inventory/check-sku', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skus }),
        });

        if (response.ok) {
          const data = await response.json();
          setExistingSkus(new Set(data.existing_skus || []));
        } else {
          console.error('Failed to check SKUs');
          setExistingSkus(new Set());
        }
      } catch (error) {
        console.error('Error checking SKUs:', error);
        setExistingSkus(new Set());
      } finally {
        setIsCheckingSkus(false);
      }
    };

    checkExistingSkus();
  }, [step, csvData, editedData, columnMappings, authenticatedFetch]);

  /**
   * Handle the import process
   */
  const handleImportProcess = useCallback(async () => {
    try {
      setStep('importing');
      setImportProgress(0);
      
      // Debug: Check data source
      console.log('🔍 Import process starting:');
      console.log('  editedData length:', editedData.length);
      console.log('  csvData length:', csvData.length);
      console.log('  Using:', editedData.length > 0 ? 'EDITED' : 'ORIGINAL');
      
      const dataToImport = editedData.length > 0 ? editedData : csvData;
      const totalRecords = dataToImport.length;
      
      // Estimate time based on record count (adjust multiplier as needed)
      // Rough estimate: 50ms per record for processing
      const estimatedTime = Math.max(2000, totalRecords * 50); // Minimum 2 seconds
      const progressInterval = 100; // Update every 100ms
      const incrementPerInterval = (90 / estimatedTime) * progressInterval; // Go up to 90%, last 10% when API completes
      
      // Start progress simulation
      const progressTimer = setInterval(() => {
        setImportProgress(prev => {
          const next = prev + incrementPerInterval;
          return next >= 90 ? 90 : next; // Cap at 90%
        });
      }, progressInterval);
      
      // Debug first row
      if (dataToImport.length > 0) {
        console.log('🔍 First row to import:', dataToImport[0]);
        console.log('🔍 Keys in first row:', Object.keys(dataToImport[0]));
      }

      // Map data according to column mappings
      const mappedData = dataToImport.map((row, rowIndex) => {
        const transformed: Record<string, unknown> = {};
        
        columnMappings.forEach(mapping => {
          // Get value directly from row using CSV column name
          const value = row[mapping.csvColumn];
          transformed[mapping.dbField] = value;
          
          // Debug label field for first row
          if (rowIndex === 0 && mapping.dbField === 'label') {
            console.log(`🔍 Mapping "label":`);
            console.log(`  CSV Column: "${mapping.csvColumn}"`);
            console.log(`  Value from row: "${value}"`);
            console.log(`  Column exists in row: ${mapping.csvColumn in row}`);
          }
        });
        
        return transformed;
      });

      // Debug: Log sample for verification
      console.log('✅ Mapped data ready for import:', {
        totalRows: mappedData.length,
        sampleRow: mappedData[0],
        mappings: columnMappings.length
      });

      // Call import API
      const response = await authenticatedFetch('/api/dashboard/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: mappedData }),
      });

      const result = await response.json();

      // Clear progress timer and set to 100%
      clearInterval(progressTimer);
      setImportProgress(100);

      if (response.ok && result.success) {
        setImportResults(result.results);
        // Small delay to show 100% before moving to complete
        setTimeout(() => {
          setStep('complete');
        }, 500);
        showToast.success(result.message || TOAST_MESSAGES.SUCCESS.IMPORT_COMPLETED);
      } else {
        throw new Error(result.error || TOAST_MESSAGES.ERROR.IMPORT_FAILED);
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.ERROR.IMPORT_FAILED;
      showToast.error(errorMessage);
      setImportProgress(0);
      setStep('preview'); // Go back to preview on error
    }
  }, [csvData, editedData, columnMappings, authenticatedFetch]);

  /**
   * Reset all import state
   */
  const handleReset = useCallback(() => {
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMappings([]);
    setEditedData([]);
    setImportResults({ success: 0, failed: 0, errors: [] });
    setStep('upload');
  }, []);

  /**
   * Navigate to inventory page
   */
  const handleViewInventory = useCallback(() => {
    router.push('/dashboard/inventory');
  }, [router]);

  return {
    // Step management
    step,
    setStep,
    
    // Data
    csvData,
    csvHeaders,
    columnMappings,
    editedData,
    importResults,
    
    // Loading states
    isUploading,
    isCheckingPallets,
    isCheckingSkus,
    
    // Validation
    existingPallets,
    existingSkus,
    
    // Import progress
    importProgress,
    
    // Actions
    parseCSV,
    handleImportProcess,
    handleReset,
    handleViewInventory,
    setColumnMappings,
    setEditedData,
    
    // Permissions
    hasPermission,
  };
}

