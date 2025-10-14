'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Layers,
  Clock,
  FileText,
  Building2,
  Box,
  AlertTriangle,
  ChevronUp,
  BarChart3,
  Navigation,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { AccessDenied } from '@/components/ui';
import { PhotoGallery } from '@/components/dashboard/inventory';
import { useAuth } from '@/contexts/AuthContext';
import type { InventoryUnitType, MediaType } from '@/components/dashboard/inventory/types';

// Google Maps type declaration
declare global {
  interface Window {
    google: typeof google;
  }
}

export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { authenticatedFetch, hasPermission } = useAuth();
  const [inventory, setInventory] = useState<InventoryUnitType | null>(null);
  const [photos, setPhotos] = useState<MediaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const inventoryId = params.id as string;

  const fetchInventoryDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(
        `/api/dashboard/inventory/${inventoryId}`
      );

      if (response.ok) {
        const data = await response.json();
        setInventory(data.inventory);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load inventory details');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('An error occurred while fetching inventory');
    } finally {
      setLoading(false);
    }
  }, [inventoryId, authenticatedFetch]);

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await authenticatedFetch(
        `/api/dashboard/inventory/${inventoryId}/media`
      );

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.media || []);
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  }, [inventoryId, authenticatedFetch]);

  // Load Google Maps script
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );

    if (existingScript) {
      // Script already exists, just wait for it to load
      if (window.google) {
        setMapLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setMapLoaded(true));
      }
      return;
    }

    // Only load if google is not available and no script tag exists
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map when data and script are loaded
  useEffect(() => {
    if (mapLoaded && inventory?.location_site && window.google) {
      const mapElement = document.getElementById('location-map');
      if (mapElement) {
        // Geocode the location
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: inventory.location_site }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const map = new window.google.maps.Map(mapElement, {
              center: location,
              zoom: 15,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }],
                },
              ],
            });

            // Add marker
            new window.google.maps.Marker({
              position: location,
              map: map,
              title: inventory.location_site,
              animation: window.google.maps.Animation.DROP,
            });
          }
        });
      }
    }
  }, [mapLoaded, inventory?.location_site]);

  useEffect(() => {
    if (hasPermission('inventory.read')) {
      fetchInventoryDetails();
      fetchPhotos();
    }
  }, [hasPermission, fetchInventoryDetails, fetchPhotos]);

  if (!hasPermission('inventory.read')) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You don't have permission to view inventory details."
      />
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading inventory details..." />;
  }

  if (error || !inventory) {
    return (
      <AccessDenied
        title="Error Loading Data"
        message={error || 'Inventory not found'}
      />
    );
  }

  const statusConfig: Record<string, { label: string; className: string; bgClass: string }> = {
    in_storage: { 
      label: 'In Storage', 
      className: 'bg-blue-100 text-blue-800 border-blue-200', 
      bgClass: 'bg-blue-50' 
    },
    reserved: { 
      label: 'Reserved', 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      bgClass: 'bg-yellow-50' 
    },
    on_truck: { 
      label: 'On Truck', 
      className: 'bg-purple-100 text-purple-800 border-purple-200', 
      bgClass: 'bg-purple-50' 
    },
    onsite: { 
      label: 'Onsite', 
      className: 'bg-green-100 text-green-800 border-green-200', 
      bgClass: 'bg-green-50' 
    },
    returned: { 
      label: 'Returned', 
      className: 'bg-gray-100 text-gray-800 border-gray-200', 
      bgClass: 'bg-gray-50' 
    },
  };

  const stackabilityConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    stackable: { 
      label: 'Stackable', 
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: <Layers className="h-4 w-4" />
    },
    non_stackable: { 
      label: 'Non-Stackable', 
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    top_only: { 
      label: 'Top Only', 
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <ChevronUp className="h-4 w-4" />
    },
    bottom_only: { 
      label: 'Bottom Only', 
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Box className="h-4 w-4" />
    },
  };

  const currentStatus = statusConfig[inventory.status];
  const currentStackability = inventory.item?.stackability 
    ? stackabilityConfig[inventory.item.stackability] 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-12">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </button>
          </div>

          {/* Title Section */}
          <div className="mt-6 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {inventory.item?.label || 'Unnamed Item'}
                </h1>
                <div className="mt-1 flex items-center space-x-3">
                  {inventory.pallet_no && (
                    <span className="text-blue-100 text-sm">
                      Pallet #{inventory.pallet_no}
                    </span>
                  )}
                  {inventory.item?.sku && (
                    <>
                      <span className="text-blue-100">•</span>
                      <span className="text-blue-100 text-sm">
                        SKU: {inventory.item.sku}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 ${currentStatus.className}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inventory.item?.volume_m3 ? `${inventory.item.volume_m3} m³` : '-'}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weight</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inventory.item ? `${inventory.item.weight_kg} kg` : '-'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Weight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quantity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inventory.quantity || 1}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Box className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Priority</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {inventory.item?.priority !== null && inventory.item?.priority !== undefined 
                    ? inventory.item.priority 
                    : '-'}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Layers className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Project Info */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                  Client & Project Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Client
                    </label>
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-gray-900 font-medium">
                        {inventory.client?.company_name || inventory.client?.full_name || '-'}
                      </span>
                    </div>
                  </div>

                  {inventory.project && (
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Project
                      </label>
                      <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{inventory.project.name}</p>
                          <p className="text-xs text-gray-500">{inventory.project.code}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Inventory Date
                    </label>
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">
                        {new Date(inventory.inventory_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Created On
                    </label>
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900 text-sm">
                        {new Date(inventory.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {inventory.item?.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">
                      {inventory.item.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Dimensions & Physical Properties */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Ruler className="h-5 w-5 mr-2 text-gray-600" />
                  Physical Properties & Specifications
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Dimensions (L × W × H)
                    </label>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-900">
                            {inventory.item
                              ? `${inventory.item.length_mm} × ${inventory.item.width_mm} × ${inventory.item.height_mm}`
                              : '-'}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">millimeters</p>
                        </div>
                        <Ruler className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  {currentStackability && (
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Stackability
                      </label>
                      <div className={`rounded-lg p-4 border-2 ${currentStackability.className}`}>
                        <div className="flex items-center space-x-3">
                          {currentStackability.icon}
                          <span className="font-semibold">
                            {currentStackability.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {inventory.item?.top_load_rating_kg !== null && 
                   inventory.item?.top_load_rating_kg !== undefined && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Top Load Rating
                      </label>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-lg font-semibold text-gray-900">
                          {inventory.item.top_load_rating_kg} kg
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Maximum load capacity</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Handling Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Special Handling Requirements
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {inventory.item?.fragile && (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-800 border-2 border-red-200">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Fragile - Handle with Care
                      </div>
                    )}
                    {inventory.item?.keep_upright && (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-orange-100 text-orange-800 border-2 border-orange-200">
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Keep Upright - This Side Up
                      </div>
                    )}
                    {inventory.item?.orientation_locked && (
                      <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-800 border-2 border-purple-200">
                        <Navigation className="h-4 w-4 mr-2" />
                        Orientation Locked
                      </div>
                    )}
                    {!inventory.item?.fragile && !inventory.item?.keep_upright && !inventory.item?.orientation_locked && (
                      <p className="text-sm text-gray-500 italic">No special handling requirements</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Photos Gallery */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Photo Gallery</h2>
              </div>
              <div className="p-6">
                <PhotoGallery
                  inventoryUnitId={inventoryId}
                  photos={photos}
                  onPhotosUpdate={fetchPhotos}
                  hasPermission={hasPermission}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Location & Map */}
          <div className="space-y-6">
            {/* Location with Map */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Warehouse Location
                </h2>
              </div>

              {/* Google Map */}
              <div 
                id="location-map" 
                className="w-full h-64 bg-gray-200"
                style={{ minHeight: '256px' }}
              >
                {!mapLoaded && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Site Location
                  </label>
                  <div className="flex items-start space-x-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{inventory.location_site}</span>
                  </div>
                </div>

                {(inventory.location_aisle || inventory.location_bay || inventory.location_level) && (
                  <div className="grid grid-cols-3 gap-3">
                    {inventory.location_aisle && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                          Aisle
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-center">
                          <span className="text-lg font-bold text-gray-900">
                            {inventory.location_aisle}
                          </span>
                        </div>
                      </div>
                    )}
                    {inventory.location_bay && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                          Bay
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-center">
                          <span className="text-lg font-bold text-gray-900">
                            {inventory.location_bay}
                          </span>
                        </div>
                      </div>
                    )}
                    {inventory.location_level && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                          Level
                        </label>
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-center">
                          <span className="text-lg font-bold text-gray-900">
                            {inventory.location_level}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {inventory.location_notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Location Notes
                    </label>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {inventory.location_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Movement History */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Movement History
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Movement history coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">Track all movements and status changes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
