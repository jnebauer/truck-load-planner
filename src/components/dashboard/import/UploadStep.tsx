import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, Sparkles, FileText, Zap, AlertCircle } from 'lucide-react';

interface UploadStepProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

export default function UploadStep({ onFileSelect, isUploading }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
          <Upload className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Import Your Inventory
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload a CSV file to bulk import inventory items. Our system will automatically map your columns and validate your data.
        </p>
      </div>

      {/* Main Upload Card - TOP PRIORITY */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-8">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="csv-file-input"
            />
            
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer block"
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                      <p className="font-medium text-gray-900 mb-2">Processing your file...</p>
                      <p className="text-sm text-gray-500">Analyzing data and mapping columns</p>
                </div>
              ) : selectedFileName ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="font-medium text-gray-900 mb-2">{selectedFileName}</p>
                  <p className="text-sm text-gray-500 mb-4">File selected successfully</p>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
                    <Sparkles className="h-5 w-5 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                      <p className="font-semibold text-gray-900 mb-1">
                        Drop your CSV file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports CSV files up to 50MB
                      </p>
                      <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Features Grid */}
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Auto-Mapping</h4>
                <p className="text-xs text-gray-600">Automatically detects and maps your CSV columns</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Smart Validation</h4>
                <p className="text-xs text-gray-600">Real-time data validation and error detection</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Edit Preview</h4>
                <p className="text-xs text-gray-600">Review and edit data before importing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Download Card - Second Priority */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 p-6 mb-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center shadow-md animate-pulse">
            <FileSpreadsheet className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  📥 Download Sample CSV Template
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  <strong>Recommended:</strong> Download our pre-formatted template with sample data. It includes all required columns with proper naming and example values to guide you.
                </p>
                <a
                  href="/sample-import.csv"
                  download="inventory-import-template.csv"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template CSV
                </a>
          </div>
        </div>
      </div>

      {/* Important Instructions Section - Last */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 mb-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-2">📋 Important Instructions - Read Before Upload</h2>
                <p className="text-sm text-gray-700">
                  Please review these requirements carefully to ensure a successful import. All data will be validated before importing.
                </p>
          </div>
        </div>

        {/* Required Fields */}
        <div className="bg-white rounded-xl p-5 mb-4 border border-amber-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">REQUIRED</span>
            Required CSV Columns (Must Have These)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Client Name</span>
              <span className="text-gray-500">- Company/Client name</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Client Email</span>
              <span className="text-gray-500">- Valid email address</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Project Name</span>
              <span className="text-gray-500">- Project identifier</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Item Label</span>
              <span className="text-gray-500">- Item description</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Length (mm)</span>
              <span className="text-gray-500">- In millimeters</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Width (mm)</span>
              <span className="text-gray-500">- In millimeters</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Height (mm)</span>
              <span className="text-gray-500">- In millimeters</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Weight (kg)</span>
              <span className="text-gray-500">- In kilograms</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="font-medium text-gray-900">Warehouse Site</span>
              <span className="text-gray-500">- Location name</span>
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="bg-white rounded-xl p-5 mb-4 border border-amber-200">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">OPTIONAL</span>
            Optional Columns (Recommended)
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• <strong>SKU, Description, Pallet Number, Inventory Date</strong></p>
            <p>• <strong>Location Details:</strong> Aisle, Bay, Level, Location Notes</p>
            <p>• <strong>Item Properties:</strong> Quantity, Status, Stackability, Fragile, Keep Upright, Priority</p>
            <p>• <strong>Photo URLs:</strong> Pallet Photo URL, Label Photo URL, Racking Photo URL, Onsite Photo URL</p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-100 rounded-xl p-5 border border-amber-300">
          <h3 className="font-bold text-amber-900 mb-3">⚠️ Important Notes:</h3>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">1.</span>
              <span><strong>Auto-Mapping:</strong> System will automatically match your CSV column names to our fields. Use exact names like &ldquo;Client Name&rdquo;, &ldquo;Length (mm)&rdquo; for best results.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">2.</span>
              <span><strong>Client & Project:</strong> If client email exists, we&apos;ll use that client. Otherwise, we&apos;ll create a new client with a secure password.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">3.</span>
              <span><strong>Validation:</strong> All data will be validated in Step 3 (Review Data) before import. You can edit any cell if needed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">4.</span>
              <span><strong>Photo URLs:</strong> You can provide public image URLs, and they will be attached to inventory items.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">5.</span>
              <span><strong>File Format:</strong> Only CSV files are supported. Maximum file size: 50MB.</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}

