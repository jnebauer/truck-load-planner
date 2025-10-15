'use client';

import React from 'react';
import { AccessDenied } from '@/components/ui';
import { useImport } from '@/hooks/dashboard';
import {
  UploadStep,
  PreviewStep,
  ImportingStep,
  CompleteStep,
  ProgressBar,
} from '@/components/dashboard/import';

const REQUIRED_FIELDS = [
  { field: 'client_name', label: 'Client Name', type: 'text' },
  { field: 'client_email', label: 'Client Email', type: 'text' },
  { field: 'project_name', label: 'Project Name', type: 'text' },
  { field: 'label', label: 'Item Label', type: 'text' },
  { field: 'length_mm', label: 'Length (mm)', type: 'number' },
  { field: 'width_mm', label: 'Width (mm)', type: 'number' },
  { field: 'height_mm', label: 'Height (mm)', type: 'number' },
  { field: 'weight_kg', label: 'Weight (kg)', type: 'number' },
  { field: 'location_site', label: 'Warehouse Site', type: 'text' },
];

const OPTIONAL_FIELDS = [
  { field: 'sku', label: 'SKU', type: 'text' },
  { field: 'description', label: 'Description', type: 'text' },
  { field: 'pallet_no', label: 'Pallet Number', type: 'text' },
  { field: 'inventory_date', label: 'Inventory Date', type: 'date' },
  { field: 'location_aisle', label: 'Aisle', type: 'text' },
  { field: 'location_bay', label: 'Bay', type: 'text' },
  { field: 'location_level', label: 'Level', type: 'text' },
  { field: 'location_notes', label: 'Location Notes', type: 'text' },
  { field: 'quantity', label: 'Quantity', type: 'number' },
  { field: 'status', label: 'Status', type: 'text' },
  { field: 'stackability', label: 'Stackability', type: 'enum' },
  {
    field: 'top_load_rating_kg',
    label: 'Top Load Rating (kg)',
    type: 'number',
  },
  { field: 'priority', label: 'Loading Priority', type: 'number' },
  { field: 'fragile', label: 'Fragile', type: 'boolean' },
  { field: 'keep_upright', label: 'Keep Upright', type: 'boolean' },
  { field: 'orientation_locked', label: 'Orientation Locked', type: 'boolean' },
  { field: 'pallet_photo_url', label: 'Pallet Photo URL', type: 'text' },
  { field: 'label_photo_url', label: 'Label Photo URL', type: 'text' },
  { field: 'racking_photo_url', label: 'Racking Photo URL', type: 'text' },
  { field: 'onsite_photo_url', label: 'Onsite Photo URL', type: 'text' },
];

export default function ImportPage() {
  const {
    // Step management
    step,
    setStep,

    // Data
    csvData,
    csvHeaders: _csvHeaders,
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
    setEditedData,

    // Permissions
    hasPermission,
  } = useImport(REQUIRED_FIELDS, OPTIONAL_FIELDS);

  if (!hasPermission('inventory.create')) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-12">
      {/* Progress Bar */}
      <ProgressBar step={step} />

      {/* Content Area */}
      <div className="container mx-auto px-4 py-12">
        {step === 'upload' && (
          <UploadStep onFileSelect={parseCSV} isUploading={isUploading} />
        )}

        {step === 'preview' && (
          <PreviewStep
            csvData={csvData}
            editedData={editedData}
            columnMappings={columnMappings}
            requiredFields={REQUIRED_FIELDS}
            optionalFields={OPTIONAL_FIELDS}
            existingPallets={existingPallets}
            existingSkus={existingSkus}
            isCheckingPallets={isCheckingPallets}
            isCheckingSkus={isCheckingSkus}
            onDataEdit={setEditedData}
            onResetChanges={() => setEditedData([])}
            onBack={() => setStep('upload')}
            onStartImport={handleImportProcess}
          />
        )}

        {step === 'importing' && <ImportingStep progress={importProgress} />}

        {step === 'complete' && (
          <CompleteStep
            importResults={importResults}
            onImportAnother={handleReset}
            onViewInventory={handleViewInventory}
          />
        )}
      </div>
    </div>
  );
}
