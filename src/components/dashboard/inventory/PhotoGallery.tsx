'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Trash2, X, Upload, Camera } from 'lucide-react';
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

const TAG_CONFIG = {
  pallet: {
    label: 'Pallet',
    description: 'Photos of the pallet itself',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    icon: '📦',
  },
  label: {
    label: 'Label',
    description: 'Close-up photos of labels',
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    icon: '🏷️',
  },
  racking: {
    label: 'Racking',
    description: 'Location & racking photos',
    gradient: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    icon: '📍',
  },
  onsite: {
    label: 'Onsite',
    description: 'Photos from the site',
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    icon: '🏢',
  },
};

export default function PhotoGallery({
  inventoryUnitId,
  photos,
  onPhotosUpdate,
  hasPermission,
}: PhotoGalleryProps) {
  const { authenticatedFetch } = useAuth();
  const [uploadingTag, setUploadingTag] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const fileInputRefs = {
    pallet: useRef<HTMLInputElement>(null),
    label: useRef<HTMLInputElement>(null),
    racking: useRef<HTMLInputElement>(null),
    onsite: useRef<HTMLInputElement>(null),
  };

  const handlePhotoUpload = useCallback(
    async (file: File, tag: string) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP allowed');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast.error('File size too large. Maximum 5MB');
        return;
      }

      setUploadingTag(tag);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'inventory');

        const uploadResponse = await authenticatedFetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const { data: uploadData } = await uploadResponse.json();

        const mediaResponse = await authenticatedFetch(
          `/api/dashboard/inventory/${inventoryUnitId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: uploadData.url,
              tag,
              content_type: file.type,
            }),
          }
        );

        if (mediaResponse.ok) {
          onPhotosUpdate();
        } else {
          const data = await mediaResponse.json();
          showToast.error(data.error || 'Failed to save photo');
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        showToast.error(error instanceof Error ? error.message : 'Failed to upload photo');
      } finally {
        setUploadingTag(null);
      }
    },
    [inventoryUnitId, authenticatedFetch, onPhotosUpdate]
  );

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      try {
        const response = await authenticatedFetch(
          `/api/dashboard/inventory/${inventoryUnitId}/media?media_id=${photoId}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          showToast.success('Photo deleted!');
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, tag: string) => {
    const file = e.target.files?.[0];
    if (file) {
      await handlePhotoUpload(file, tag);
      const ref = fileInputRefs[tag as keyof typeof fileInputRefs];
      if (ref.current) {
        ref.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(tag);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      await handlePhotoUpload(file, tag);
    }
  };

  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.tag]) acc[photo.tag] = [];
    acc[photo.tag].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  // If no photos at all, show empty state
  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
          <Camera className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Yet</h3>
        <p className="text-sm text-gray-500 mb-6">Start by uploading photos to different categories</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {Object.entries(TAG_CONFIG).map(([tag, config]) => (
            <button
              key={tag}
              onClick={() => fileInputRefs[tag as keyof typeof fileInputRefs].current?.click()}
              disabled={!hasPermission('inventory.update') || uploadingTag === tag}
              className={`p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all ${
                !hasPermission('inventory.update') ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="text-3xl mb-2 block">{config.icon}</span>
              <p className="text-sm font-medium text-gray-700">{config.label}</p>
              <input
                ref={fileInputRefs[tag as keyof typeof fileInputRefs]}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => handleFileSelect(e, tag)}
                className="hidden"
                disabled={!hasPermission('inventory.update') || uploadingTag === tag}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Sections */}
      {Object.entries(TAG_CONFIG).map(([tag, config], index) => {
        const tagPhotos = groupedPhotos[tag] || [];
        const isFirstSection = index === 0;
        
        return (
          <div key={tag}>
            {/* Horizontal Separator Line */}
            {!isFirstSection && (
              <div className="border-t border-gray-200 mb-6" />
            )}
            
            <div className="group">
              {/* Section Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                  <span className="text-xl">{config.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{config.label}</h3>
                  <p className="text-xs text-gray-500">
                    {tagPhotos.length} {tagPhotos.length === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
                
                <input
                  ref={fileInputRefs[tag as keyof typeof fileInputRefs]}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleFileSelect(e, tag)}
                  className="hidden"
                  disabled={uploadingTag === tag}
                />
              </div>

              {/* Drag & Drop Zone */}
              {hasPermission('inventory.update') && (
                <div 
                  className={`mb-4 p-4 rounded-lg border-2 border-dashed transition-all ${
                    isDragging === tag 
                      ? `${config.bgLight} border-gray-400 scale-[1.02]` 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDragOver={(e) => handleDragOver(e, tag)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  onDrop={(e) => handleDrop(e, tag)}
                  onClick={() => fileInputRefs[tag as keyof typeof fileInputRefs].current?.click()}
                >
                  <div className="flex items-center justify-center gap-3 cursor-pointer">
                    <Upload className={`h-5 w-5 ${isDragging === tag ? config.textColor : 'text-gray-400'}`} />
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isDragging === tag ? config.textColor : 'text-gray-600'}`}>
                        {isDragging === tag ? 'Drop photo here' : 'Drag & drop photo here or click to browse'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Photos Grid */}
              {tagPhotos.length === 0 ? (
                <div className={`${config.bgLight} rounded-xl p-8 text-center`}>
                  <p className="text-sm text-gray-500">No {config.label.toLowerCase()} photos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {tagPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group/photo relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:shadow-lg transition-all"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <Image
                        src={photo.url}
                        alt={config.label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized
                      />
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                          <p className="text-xs text-white font-medium truncate">
                            {new Date(photo.created_at).toLocaleDateString()}
                          </p>
                          {hasPermission('inventory.delete') && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this photo?')) {
                                  await handleDeletePhoto(photo.id);
                                }
                              }}
                              className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative w-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-[85vh] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={selectedPhoto.url}
                alt={TAG_CONFIG[selectedPhoto.tag].label}
                fill
                className="object-contain"
                sizes="1400px"
                priority
                unoptimized
              />
            </div>
            
            {/* Photo Info Bar */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${TAG_CONFIG[selectedPhoto.tag].gradient} rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{TAG_CONFIG[selectedPhoto.tag].icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{TAG_CONFIG[selectedPhoto.tag].label}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedPhoto.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {hasPermission('inventory.delete') && (
                  <button
                    onClick={async () => {
                      if (confirm('Delete this photo?')) {
                        await handleDeletePhoto(selectedPhoto.id);
                        setSelectedPhoto(null);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-colors shadow-md"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
