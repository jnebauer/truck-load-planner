'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  error?: string;
  required?: boolean;
}

/**
 * ImageUpload Component
 * 
 * A reusable component for uploading images to the server
 * 
 * @param label - Label for the upload field
 * @param value - Current image URL
 * @param onChange - Callback when image is uploaded
 * @param folder - Folder to upload to (default: 'users')
 * @param error - Error message to display
 * @param required - Whether the field is required
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  folder = 'users',
  error,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(value);
  const { authenticatedFetch } = useAuth();

  // Update preview when value prop changes (e.g., when editing)
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast.error('File size too large. Maximum size is 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Use authenticatedFetch to automatically include auth headers
      const response = await authenticatedFetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      onChange(result.data.url);
      showToast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      showToast.error(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(value);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <ImageIcon className="inline h-4 w-4 mr-1" />
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex items-start space-x-4">
        {/* Preview */}
        {preview ? (
          <div className="relative w-32 h-32 rounded-lg border-2 border-gray-300 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Click to upload</p>
            </div>
          </div>
        )}

        {/* Upload Info */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            Upload a profile image (JPG, PNG, GIF, or WebP)
          </p>
          <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
          {preview && !uploading && (
            <button
              type="button"
              onClick={handleClick}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Change Image
            </button>
          )}
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

