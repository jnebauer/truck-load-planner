'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Eye, Pencil } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface ImageUploadCellProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
}

/**
 * Compact ImageUploadCell Component for Table Cells
 * 
 * Supports:
 * - Drag & Drop
 * - Click to upload
 * - Image preview
 * - URL input (if image already exists in CSV)
 */
export const ImageUploadCell: React.FC<ImageUploadCellProps> = ({
  value,
  onChange,
  folder = 'inventory',
}) => {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { authenticatedFetch } = useAuth();

  const handleUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast.error('File size too large. Maximum 5MB');
      return;
    }

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await authenticatedFetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      onChange(result.data.url);
      // showToast.success('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err);
      showToast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="w-full min-w-[85px] max-w-[85px] mx-1">
        {value ? (
          // Show image preview with view and edit icons
          <div className="relative group">
            <div className="relative w-full h-14 rounded border-2 border-gray-200 overflow-hidden bg-white">
              <Image
                src={value}
                alt="Preview"
                fill
                className="object-contain"
                sizes="85px"
                unoptimized
              />
              {/* Overlay with view and edit icons */}
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="p-0.5 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 cursor-pointer"
                  title="View Image"
                  disabled={uploading}
                >
                  <Eye className="h-2.5 w-2.5 text-gray-700" />
                </button>
                <button
                  type="button"
                  onClick={handleClick}
                  className="p-0.5 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 cursor-pointer"
                  title="Change Image"
                  disabled={uploading}
                >
                  <Pencil className="h-2.5 w-2.5 text-blue-600" />
                </button>
              </div>
            </div>
            {/* Remove button in top-right corner */}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              disabled={uploading}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
      ) : (
        // Show upload area
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-14 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 bg-gray-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <>
              {isDragging ? (
                <ImageIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <Upload className="h-4 w-4 text-gray-400" />
              )}
              <p className="text-[10px] text-gray-500 text-center px-1 mt-0.5">
                {isDragging ? 'Drop' : 'Drop'}
              </p>
            </>
          )}
        </div>
      )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Full Image Modal */}
      {showImageModal && value && (
        <div 
          className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-auto h-auto">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={value}
                alt="Full size preview"
                width={800}
                height={800}
                className="object-contain max-h-[85vh] w-auto h-auto"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

