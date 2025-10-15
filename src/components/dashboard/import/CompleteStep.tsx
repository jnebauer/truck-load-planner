import React from 'react';
import { CheckCircle, AlertTriangle, ArrowRight, XCircle, Upload, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface CompleteStepProps {
  importResults: ImportResult;
  onImportAnother: () => void;
  onViewInventory: () => void;
}

export default function CompleteStep({
  importResults,
  onImportAnother,
  onViewInventory,
}: CompleteStepProps) {
  const isFullSuccess = importResults.failed === 0;
  const totalRecords = importResults.success + importResults.failed;
  const successRate = totalRecords > 0 ? ((importResults.success / totalRecords) * 100).toFixed(1) : '0';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Compact Header */}
      <div className={`border-b border-gray-200 px-8 py-6 ${
        isFullSuccess ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${
              isFullSuccess ? 'bg-green-600' : 'bg-yellow-600'
            }`}>
              {isFullSuccess ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isFullSuccess ? 'Import Successful!' : 'Import Completed'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isFullSuccess 
                  ? 'All your inventory items have been imported successfully' 
                  : 'Import completed with some items that need attention'}
              </p>
            </div>
          </div>
          {isFullSuccess && (
            <div className="hidden md:flex items-center gap-2 text-2xl">
              <span>🎉</span>
              <span>✨</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Records */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Package className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{totalRecords}</div>
            <div className="text-sm text-gray-600 font-medium">Total Records</div>
          </div>

          {/* Success */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-600 rounded-lg p-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="text-green-600 font-semibold text-sm">{successRate}%</div>
            </div>
            <div className="text-3xl font-bold text-green-700 mb-1">{importResults.success}</div>
            <div className="text-sm text-gray-600 font-medium">Successfully Imported</div>
          </div>

          {/* Failed */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-600 rounded-lg p-2">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              {importResults.failed > 0 && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="text-3xl font-bold text-red-700 mb-1">{importResults.failed}</div>
            <div className="text-sm text-gray-600 font-medium">Failed to Import</div>
          </div>
        </div>

        {/* Success Message */}
        {isFullSuccess ? (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 rounded p-1.5 flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Perfect! All Items Imported</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  All <strong>{importResults.success} inventory items</strong> have been successfully imported and are now available in your inventory dashboard.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-600 rounded p-1.5 flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">Partial Import Completed</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>{importResults.success} items</strong> were imported successfully, but <strong>{importResults.failed} items</strong> failed. 
                  Please review the errors below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Details */}
        {importResults.errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
            <div className="bg-red-100 px-5 py-3 border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <h3 className="font-semibold text-red-900 text-sm">
                  Error Details ({importResults.errors.length} {importResults.errors.length === 1 ? 'error' : 'errors'})
                </h3>
              </div>
            </div>
            <div className="p-5 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {importResults.errors.map((err, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded p-3 border border-red-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="bg-red-100 rounded px-2 py-0.5 flex-shrink-0">
                        <span className="text-xs font-semibold text-red-700">Row {err.row}</span>
                      </div>
                      <p className="text-xs text-gray-700 flex-1 leading-relaxed">{err.error}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onImportAnother}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import Another File
          </button>
          <button
            onClick={onViewInventory}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            View Inventory
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

