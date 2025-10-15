import React from 'react';
import { Upload, Database, CheckCircle, Package, TrendingUp, Clock } from 'lucide-react';

interface ImportingStepProps {
  progress: number; // 0-100
}

export default function ImportingStep({ progress }: ImportingStepProps) {
  // Determine current step based on progress
  const getCurrentStep = (): number => {
    if (progress >= 75) return 4;
    if (progress >= 50) return 3;
    if (progress >= 25) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  // Check if a step is completed, active, or pending
  const getStepStatus = (step: number): 'completed' | 'active' | 'pending' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Compact Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400 opacity-30 rounded-full animate-ping"></div>
            <div className="relative bg-blue-600 rounded-full p-3">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Importing Your Data</h2>
            <p className="text-gray-600 text-sm mt-1">Processing your inventory records...</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Processing inventory records</span>
            </div>
            <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Process Steps in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Step 1 - Validating Data */}
          <div className={`relative rounded-lg p-5 transition-all ${
            getStepStatus(1) === 'completed' 
              ? 'bg-green-50 border border-green-200' 
              : getStepStatus(1) === 'active'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-gray-50 border border-gray-200 opacity-60'
          }`}>
            {getStepStatus(1) === 'active' && (
              <div className="absolute top-3 right-3">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-lg p-2 ${
                getStepStatus(1) === 'completed' 
                  ? 'bg-green-600' 
                  : getStepStatus(1) === 'active'
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}>
                {getStepStatus(1) === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Database className={`h-5 w-5 ${getStepStatus(1) === 'active' ? 'text-white' : 'text-gray-500'}`} />
                )}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                getStepStatus(1) === 'completed' 
                  ? 'text-green-600' 
                  : getStepStatus(1) === 'active'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {getStepStatus(1) === 'completed' ? 'Completed' : getStepStatus(1) === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Validating Data</h3>
            <p className="text-xs text-gray-600 leading-relaxed">Checking records for accuracy</p>
          </div>

          {/* Step 2 - Creating Units */}
          <div className={`relative rounded-lg p-5 transition-all ${
            getStepStatus(2) === 'completed' 
              ? 'bg-green-50 border border-green-200' 
              : getStepStatus(2) === 'active'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-gray-50 border border-gray-200 opacity-60'
          }`}>
            {getStepStatus(2) === 'active' && (
              <div className="absolute top-3 right-3">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-lg p-2 ${
                getStepStatus(2) === 'completed' 
                  ? 'bg-green-600' 
                  : getStepStatus(2) === 'active'
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}>
                {getStepStatus(2) === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Package className={`h-5 w-5 ${getStepStatus(2) === 'active' ? 'text-white' : 'text-gray-500'}`} />
                )}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                getStepStatus(2) === 'completed' 
                  ? 'text-green-600' 
                  : getStepStatus(2) === 'active'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {getStepStatus(2) === 'completed' ? 'Completed' : getStepStatus(2) === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Creating Units</h3>
            <p className="text-xs text-gray-600 leading-relaxed">Generating inventory units</p>
          </div>

          {/* Step 3 - Updating System */}
          <div className={`relative rounded-lg p-5 transition-all ${
            getStepStatus(3) === 'completed' 
              ? 'bg-green-50 border border-green-200' 
              : getStepStatus(3) === 'active'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-gray-50 border border-gray-200 opacity-60'
          }`}>
            {getStepStatus(3) === 'active' && (
              <div className="absolute top-3 right-3">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-lg p-2 ${
                getStepStatus(3) === 'completed' 
                  ? 'bg-green-600' 
                  : getStepStatus(3) === 'active'
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}>
                {getStepStatus(3) === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <TrendingUp className={`h-5 w-5 ${getStepStatus(3) === 'active' ? 'text-white' : 'text-gray-500'}`} />
                )}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                getStepStatus(3) === 'completed' 
                  ? 'text-green-600' 
                  : getStepStatus(3) === 'active'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {getStepStatus(3) === 'completed' ? 'Completed' : getStepStatus(3) === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Updating System</h3>
            <p className="text-xs text-gray-600 leading-relaxed">Synchronizing data</p>
          </div>

          {/* Step 4 - Finalizing */}
          <div className={`relative rounded-lg p-5 transition-all ${
            getStepStatus(4) === 'completed' 
              ? 'bg-green-50 border border-green-200' 
              : getStepStatus(4) === 'active'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-gray-50 border border-gray-200 opacity-60'
          }`}>
            {getStepStatus(4) === 'active' && (
              <div className="absolute top-3 right-3">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-lg p-2 ${
                getStepStatus(4) === 'completed' 
                  ? 'bg-green-600' 
                  : getStepStatus(4) === 'active'
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`}>
                <CheckCircle className={`h-5 w-5 ${getStepStatus(4) === 'pending' ? 'text-gray-500' : 'text-white'}`} />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                getStepStatus(4) === 'completed' 
                  ? 'text-green-600' 
                  : getStepStatus(4) === 'active'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {getStepStatus(4) === 'completed' ? 'Completed' : getStepStatus(4) === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Finalizing</h3>
            <p className="text-xs text-gray-600 leading-relaxed">Completing import</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded p-1.5 flex-shrink-0 mt-0.5">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1.5">Please wait</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Don&apos;t close or refresh this page. The system is automatically creating clients, assigning projects, and organizing your inventory records.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

