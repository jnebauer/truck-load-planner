import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  step: 'upload' | 'preview' | 'importing' | 'complete';
}

export default function ProgressBar({ step }: ProgressBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Upload Step Indicator */}
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                step === 'upload' 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : ['preview', 'importing', 'complete'].includes(step)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {['preview', 'importing', 'complete'].includes(step) ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="font-bold">1</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium transition-colors ${
                step === 'upload' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Upload File
              </span>
            </div>

            {/* Connector Line */}
            <div className="flex-1 h-1 mx-4 relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div 
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  ['preview', 'importing', 'complete'].includes(step) 
                    ? 'bg-gradient-to-r from-green-500 to-green-500 w-full' 
                    : 'bg-gray-200 w-0'
                }`} 
              />
            </div>

            {/* Preview/Review Data */}
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                step === 'preview' 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : ['importing', 'complete'].includes(step)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {['importing', 'complete'].includes(step) ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="font-bold">2</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium transition-colors ${
                step === 'preview' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Review Data
              </span>
            </div>

            {/* Connector Line */}
            <div className="flex-1 h-1 mx-4 relative">
              <div className="absolute inset-0 bg-gray-200 rounded-full" />
              <div 
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  step === 'complete' 
                    ? 'bg-gradient-to-r from-green-500 to-green-500 w-full' 
                    : 'bg-gray-200 w-0'
                }`} 
              />
            </div>

            {/* Complete */}
            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                step === 'complete' 
                  ? 'bg-green-600 text-white shadow-lg scale-110' 
                  : step === 'importing'
                  ? 'bg-blue-600 text-white shadow-lg scale-110 animate-pulse'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step === 'complete' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="font-bold">3</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium transition-colors ${
                step === 'complete' ? 'text-green-600' : step === 'importing' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step === 'importing' ? 'Importing...' : 'Complete'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
