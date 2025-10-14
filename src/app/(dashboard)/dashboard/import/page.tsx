'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { AccessDenied } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';

interface ParsedRow {
  [key: string]: string | number | null;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

const REQUIRED_FIELDS = [
  { field: 'client_id', label: 'Client', type: 'reference' },
  { field: 'label', label: 'Item Label', type: 'text' },
  { field: 'length_mm', label: 'Length (mm)', type: 'number' },
  { field: 'width_mm', label: 'Width (mm)', type: 'number' },
  { field: 'height_mm', label: 'Height (mm)', type: 'number' },
  { field: 'weight_kg', label: 'Weight (kg)', type: 'number' },
  { field: 'location_site', label: 'Warehouse Site', type: 'text' },
];

const OPTIONAL_FIELDS = [
  { field: 'project_id', label: 'Project', type: 'reference' },
  { field: 'sku', label: 'SKU', type: 'text' },
  { field: 'description', label: 'Description', type: 'text' },
  { field: 'pallet_no', label: 'Pallet Number', type: 'text' },
  { field: 'inventory_date', label: 'Inventory Date', type: 'date' },
  { field: 'location_aisle', label: 'Aisle', type: 'text' },
  { field: 'location_bay', label: 'Bay', type: 'text' },
  { field: 'location_level', label: 'Level', type: 'text' },
  { field: 'location_notes', label: 'Location Notes', type: 'text' },
  { field: 'quantity', label: 'Quantity', type: 'number' },
  { field: 'stackability', label: 'Stackability', type: 'enum' },
  { field: 'top_load_rating_kg', label: 'Top Load Rating (kg)', type: 'number' },
  { field: 'priority', label: 'Loading Priority', type: 'number' },
  { field: 'fragile', label: 'Fragile', type: 'boolean' },
];

export default function ImportPage() {
  const { hasPermission } = useAuth();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: [],
  });

  const parseCSV = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        showToast.error('CSV file must have at least a header row and one data row');
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      setCsvHeaders(headers);

      // Parse data rows (skip header and any empty rows)
      const data: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length === headers.length) {
          const row: ParsedRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || null;
          });
          data.push(row);
        }
      }

      setCsvData(data);
      
      // Auto-map columns based on header names
      const autoMappings: ColumnMapping[] = [];
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        
        // Try to match with required fields
        const requiredMatch = REQUIRED_FIELDS.find(f => 
          lowerHeader.includes(f.field.toLowerCase()) || 
          lowerHeader.includes(f.label.toLowerCase())
        );
        if (requiredMatch) {
          autoMappings.push({ csvColumn: header, dbField: requiredMatch.field });
          return;
        }

        // Try to match with optional fields
        const optionalMatch = OPTIONAL_FIELDS.find(f => 
          lowerHeader.includes(f.field.toLowerCase()) || 
          lowerHeader.includes(f.label.toLowerCase())
        );
        if (optionalMatch) {
          autoMappings.push({ csvColumn: header, dbField: optionalMatch.field });
        }
      });

      setColumnMappings(autoMappings);
      setStep('mapping');
      showToast.success('CSV parsed successfully!');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      showToast.error('Failed to parse CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      showToast.error('Please select a CSV file');
      return;
    }

    parseCSV(selectedFile);
  }, [parseCSV]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      parseCSV(droppedFile);
    } else {
      showToast.error('Please drop a CSV file');
    }
  }, [parseCSV]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Check permission
  if (!hasPermission('inventory.create')) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to import inventory."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Inventory</h1>
            <p className="text-sm text-gray-500">
              Bulk import inventory from CSV spreadsheet
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {['upload', 'mapping', 'preview', 'complete'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === stepName || (step === 'importing' && stepName === 'preview')
                  ? 'bg-blue-600 text-white'
                  : index < ['upload', 'mapping', 'preview', 'complete'].indexOf(step)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index < ['upload', 'mapping', 'preview', 'complete'].indexOf(step) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                {stepName}
              </span>
              {index < 3 && (
                <div className={`w-20 h-1 mx-4 ${
                  index < ['upload', 'mapping', 'preview', 'complete'].indexOf(step)
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h2>
              <p className="text-sm text-gray-500">
                Upload your inventory spreadsheet in CSV format
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file only</p>
              </label>
            </div>

            {/* Sample CSV Download */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Need a template?</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    Download our sample CSV template to see the expected format
                  </p>
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700">
                    <Download className="h-3 w-3 mr-1" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Step */}
      {step === 'mapping' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Map Columns</h2>
              <p className="text-sm text-gray-500">
                Match your CSV columns to database fields
              </p>
            </div>
            <button
              onClick={() => setStep('upload')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Found {csvHeaders.length} columns, {csvData.length} rows
            </div>

            {/* Column Mapping Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="font-medium text-sm text-gray-700">CSV Column</div>
              <div className="font-medium text-sm text-gray-700">Database Field</div>
            </div>
            
            {csvHeaders.map((header, index) => {
              const mapping = columnMappings.find(m => m.csvColumn === header);
              return (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-900">
                    {header}
                  </div>
                  <select
                    value={mapping?.dbField || ''}
                    onChange={(e) => {
                      const newMappings = columnMappings.filter(m => m.csvColumn !== header);
                      if (e.target.value) {
                        newMappings.push({ csvColumn: header, dbField: e.target.value });
                      }
                      setColumnMappings(newMappings);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                  >
                    <option value="">-- Skip --</option>
                    <optgroup label="Required">
                      {REQUIRED_FIELDS.map(field => (
                        <option key={field.field} value={field.field}>
                          {field.label}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Optional">
                      {OPTIONAL_FIELDS.map(field => (
                        <option key={field.field} value={field.field}>
                          {field.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep('preview')}
              disabled={columnMappings.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview Step - Coming Next */}
      {step === 'preview' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preview Import</h2>
          <p className="text-gray-600">Preview table coming soon...</p>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                setStep('importing');
                // TODO: Implement actual import
                setTimeout(() => {
                  setStep('complete');
                  setImportResults({ success: csvData.length, failed: 0, errors: [] });
                }, 2000);
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Start Import
            </button>
          </div>
        </div>
      )}

      {/* Importing Step */}
      {step === 'importing' && (
        <div className="bg-white rounded-lg shadow p-12">
          <LoadingSpinner text="Importing inventory..." />
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Successfully imported {importResults.success} items
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/inventory'}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              View Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

