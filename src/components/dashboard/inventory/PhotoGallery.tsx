'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';

interface Photo {
  id: string;
  url: string;
  tag: 'pallet' | 'label' | 'racking' | 'onsite';
  created_at: string;
}

interface PhotoGalleryProps {
  inventoryUnitId: string;
  photos: Photo[];
  onPhotosUpdate: () => void;
  hasPermission: (permission: string) => boolean;
}

const TAG_LABELS = {
  pallet: { label: 'Pallet Photo', color: 'bg-blue-100 text-blue-800' },
  label: { label: 'Label Photo', color: 'bg-green-100 text-green-800' },
  racking: { label: 'Location Photo', color: 'bg-yellow-100 text-yellow-800' },
  onsite: { label: 'Onsite Photo', color: 'bg-purple-100 text-purple-800' },
};

export default function PhotoGallery({
  inventoryUnitId,
  photos,
  onPhotosUpdate,
  hasPermission,
}: PhotoGalleryProps) {
  const { authenticatedFetch } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<'pallet' | 'label' | 'racking' | 'onsite'>('pallet');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handlePhotoUpload = useCallback(
    async (imageUrl: string) => {
      if (!imageUrl) return;

      setIsUploading(true);
      try {
        const response = await authenticatedFetch(
          `/api/dashboard/inventory/${inventoryUnitId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: imageUrl,
              tag: selectedTag,
              content_type: 'image/jpeg',
            }),
          }
        );

        if (response.ok) {
          showToast.success('Photo uploaded successfully!');
          setShowUploadModal(false);
          onPhotosUpdate();
        } else {
          const data = await response.json();
          showToast.error(data.error || 'Failed to upload photo');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        showToast.error('Failed to upload photo');
      } finally {
        setIsUploading(false);
      }
    },
    [inventoryUnitId, selectedTag, authenticatedFetch, onPhotosUpdate]
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      if (!confirm('Are you sure you want to delete this photo?')) return;

      try {
        const response = await authenticatedFetch(
          `/api/dashboard/inventory/${inventoryUnitId}/media?media_id=${photoId}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          showToast.success('Photo deleted successfully!');
          setSelectedPhoto(null);
          onPhotosUpdate();
        } else {
          const data = await response.json();
          showToast.error(data.error || 'Failed to delete photo');
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
        showToast.error('Failed to delete photo');
      }
    },
    [inventoryUnitId, authenticatedFetch, onPhotosUpdate]
  );

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.tag]) acc[photo.tag] = [];
    acc[photo.tag].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Photos</h3>
          <span className="text-sm text-gray-500">({photos.length})</span>
        </div>
        {hasPermission('inventory.update') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </button>
        )}
      </div>

      {/* Photo Grid by Tag */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No photos uploaded yet</p>
          {hasPermission('inventory.update') && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              Add First Photo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(TAG_LABELS).map(([tag, { label, color }]) => {
            const tagPhotos = groupedPhotos[tag] || [];
            if (tagPhotos.length === 0) return null;

            return (
              <div key={tag}>
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                    {label}
                  </span>
                  <span className="text-sm text-gray-500">({tagPhotos.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tagPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-200 group-hover:border-blue-500 transition-colors h-40 bg-gray-100"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.url}
                        alt={label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                      />
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center z-10">
                        <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upload Photo</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Type
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value as typeof selectedTag)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                >
                  <option value="pallet">Pallet Photo</option>
                  <option value="label">Label Photo</option>
                  <option value="racking">Location/Racking Photo</option>
                  <option value="onsite">Onsite Photo</option>
                </select>
              </div>
              <ImageUpload
                label="Upload Photo"
                onChange={handlePhotoUpload}
                folder="inventory"
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-4xl w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10 bg-gray-800 bg-opacity-50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative w-full h-[70vh] rounded-lg overflow-hidden bg-white">
              <Image
                src={selectedPhoto.url}
                alt={TAG_LABELS[selectedPhoto.tag].label}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-4 flex items-center justify-between">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TAG_LABELS[selectedPhoto.tag].color}`}>
                  {TAG_LABELS[selectedPhoto.tag].label}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selectedPhoto.created_at).toLocaleString()}
                </p>
              </div>
              {hasPermission('inventory.delete') && (
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

