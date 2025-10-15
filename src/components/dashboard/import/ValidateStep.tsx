'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  FolderKanban, 
  ArrowRight, 
  ArrowLeft, 
  CheckSquare,
  TrendingUp,
  Database,
  Zap,
  Box
} from 'lucide-react';

interface ParsedRow {
  [key: string]: string | number | null;
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

interface FieldDefinition {
  field: string;
  label: string;
  type: string;
}

interface ValidateStepProps {
  csvData: ParsedRow[];
  csvHeaders: string[];
  columnMappings: ColumnMapping[];
  requiredFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
  onBack: () => void;
  onNext: () => void;
}

export function ValidateStep({
  csvData,
  csvHeaders,
  columnMappings,
  requiredFields,
  onBack,
  onNext,
}: ValidateStepProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate validation statistics
  const validationStats = useMemo(() => {
    const stats = {
      totalRows: csvData.length,
      validRows: 0,
      invalidRows: 0,
      mappedColumns: columnMappings.length,
      totalColumns: csvHeaders.length,
      missingRequired: [] as string[],
      uniqueClients: new Set<string>(),
      uniqueProjects: new Set<string>(),
      totalItems: 0,
      errors: [] as { row: number; field: string; message: string }[],
    };

    // Check for missing required fields
    requiredFields.forEach((field) => {
      const isMapped = columnMappings.some((m) => m.dbField === field.field);
      if (!isMapped) {
        stats.missingRequired.push(field.label);
      }
    });

    // Validate each row
    csvData.forEach((row, index) => {
      let rowValid = true;

      // Check required fields
      requiredFields.forEach((field) => {
        const mapping = columnMappings.find((m) => m.dbField === field.field);
        if (mapping) {
          const value = row[mapping.csvColumn];
          if (!value || String(value).trim() === '') {
            stats.errors.push({
              row: index + 1,
              field: field.label,
              message: `${field.label} is required`,
            });
            rowValid = false;
          }
        }
      });

      // Track unique clients and projects
      const clientEmailMapping = columnMappings.find((m) => m.dbField === 'client_email');
      const projectNameMapping = columnMappings.find((m) => m.dbField === 'project_name');

      if (clientEmailMapping && row[clientEmailMapping.csvColumn]) {
        stats.uniqueClients.add(String(row[clientEmailMapping.csvColumn]).toLowerCase().trim());
      }

      if (projectNameMapping && row[projectNameMapping.csvColumn]) {
        stats.uniqueProjects.add(String(row[projectNameMapping.csvColumn]).toLowerCase().trim());
      }

      if (rowValid) {
        stats.validRows++;
        stats.totalItems++;
      } else {
        stats.invalidRows++;
      }
    });

    return stats;
  }, [csvData, csvHeaders, columnMappings, requiredFields]);

  const canProceed = validationStats.missingRequired.length === 0 && validationStats.validRows > 0;
  const successRate = Math.round((validationStats.validRows / validationStats.totalRows) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Animation */}
      <div className="text-center mb-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 shadow-2xl transition-all duration-1000 ${
          isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
        }`}>
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Smart Data Analysis
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI-powered validation and intelligent field mapping completed
        </p>
      </div>

      {/* Success Banner */}
      {canProceed && validationStats.invalidRows === 0 && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center shadow-lg">
              <CheckSquare className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-1">Perfect! Ready to Import</h3>
              <p className="text-sm text-green-700">
                All <strong>{validationStats.validRows} records</strong> passed validation successfully
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-4xl font-bold text-green-600">{successRate}%</div>
              <div className="text-xs text-green-700 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard - Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Records */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <Database className="h-6 w-6 text-white mb-4 opacity-90" />
          <div className="text-2xl font-semibold text-white mb-2">{validationStats.totalRows}</div>
          <div className="text-sm font-medium text-blue-100">Total Records</div>
          <div className="mt-3 text-xs text-blue-100">
            {validationStats.totalColumns} columns detected
          </div>
        </div>

        {/* Ready to Import */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <CheckCircle className="h-6 w-6 text-white mb-4 opacity-90" />
          <div className="text-2xl font-semibold text-white mb-2">{validationStats.validRows}</div>
          <div className="text-sm font-medium text-green-100">Ready to Import</div>
          <div className="mt-3 flex items-center gap-2 text-xs text-green-100">
            <TrendingUp className="h-3 w-3" />
            {successRate}% validation rate
          </div>
        </div>

        {/* Clients Detected */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <Users className="h-6 w-6 text-white mb-4 opacity-90" />
          <div className="text-2xl font-semibold text-white mb-2">{validationStats.uniqueClients.size}</div>
          <div className="text-sm font-medium text-purple-100">Unique Clients</div>
          <div className="mt-3 text-xs text-purple-100">
            Auto-create if needed
          </div>
        </div>

        {/* Projects Found */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <FolderKanban className="h-6 w-6 text-white mb-4 opacity-90" />
          <div className="text-2xl font-semibold text-white mb-2">{validationStats.uniqueProjects.size}</div>
          <div className="text-sm font-medium text-indigo-100">Projects Detected</div>
          <div className="mt-3 text-xs text-indigo-100">
            Organized and ready
          </div>
        </div>
      </div>

      {/* Column Mapping Visual */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Smart Field Mapping</h2>
            <p className="text-sm text-gray-600">
              Automatically matched <strong>{columnMappings.length} of {csvHeaders.length}</strong> columns
            </p>
          </div>
        </div>

        {/* Mapping Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Detection Rate</span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round((columnMappings.length / csvHeaders.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(columnMappings.length / csvHeaders.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Mapped Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columnMappings.map((mapping, index) => {
            const isRequired = requiredFields.some(f => f.field === mapping.dbField);
            return (
              <div 
                key={`${mapping.csvColumn}-${index}`}
                className={`group relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-lg ${
                  isRequired 
                    ? 'border-red-200 bg-red-50 hover:border-red-300' 
                    : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    isRequired ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    {isRequired ? (
                      <AlertTriangle className="h-4 w-4 text-white" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                      CSV Column
                    </div>
                    <div className="font-semibold text-gray-900 truncate mb-2">
                      {mapping.csvColumn}
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {mapping.dbField.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                {isRequired && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      REQUIRED
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Errors Section */}
      {validationStats.missingRequired.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shadow-md">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-2">Missing Required Columns</h3>
              <p className="text-sm text-red-700 mb-4">
                Your CSV is missing these required fields. Please add them and upload again.
              </p>
              <div className="flex flex-wrap gap-2">
                {validationStats.missingRequired.map((field, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200">
                    <Box className="h-4 w-4" />
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {validationStats.invalidRows > 0 && validationStats.missingRequired.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shadow-md">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Data Quality Issues ({validationStats.invalidRows} rows)
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                Some rows have missing required values. You can fix these in the next step.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {validationStats.errors.slice(0, 5).map((error, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <span className="font-semibold text-yellow-900">Row {error.row}:</span>
                    <span className="text-sm text-yellow-800 ml-2">{error.message}</span>
                  </div>
                ))}
                {validationStats.errors.length > 5 && (
                  <p className="text-sm text-yellow-700 italic pt-2">
                    ... and {validationStats.errors.length - 5} more issues
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Upload</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title={!canProceed ? 'Please fix errors before continuing' : 'Continue to review data'}
        >
          <span>{canProceed ? 'Continue to Review' : 'Fix Errors First'}</span>
          {canProceed && (
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>
    </div>
  );
}
