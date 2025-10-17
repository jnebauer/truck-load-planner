'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { inventoryFormSchema, InventoryFormData } from '@/lib/validations';
import { TOAST_MESSAGES } from '@/lib/backend/constants';
import type {
  InventoryUnitType,
  InventoryStatsType,
} from '@/components/dashboard/inventory/types';

const ITEMS_PER_PAGE = 20;

export function useInventory() {
  const { authenticatedFetch, hasPermission } = useAuth();
  const [inventory, setInventory] = useState<InventoryUnitType[]>([]);
  const [stats, setStats] = useState<InventoryStatsType>({
    totalUnits: 0,
    inStorage: 0,
    reserved: 0,
    onTruck: 0,
    onsite: 0,
    returned: 0,
    totalVolume: 0,
    totalWeight: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(ITEMS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryUnitType | null>(null);

  // Form setup
  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema) as never,
    defaultValues: {
      clientId: '',
      label: '',
      description: '',
      lengthMm: undefined,
      widthMm: undefined,
      heightMm: undefined,
      volumeM3: undefined,
      weightKg: undefined,
      stackability: 'stackable',
      topLoadRatingKg: undefined,
      orientationLocked: false,
      fragile: false,
      keepUpright: true,
      priority: null,
      palletNo: '',
      inventoryDate: new Date().toISOString().split('T')[0],
      locationSite: '',
      locationLatitude: null,
      locationLongitude: null,
      locationAisle: '',
      locationBay: '',
      locationLevel: '',
      locationNotes: '',
      quantity: 1,
      status: 'in_storage',
    },
  });

  // Pallet validation state
  const [palletValidation, setPalletValidation] = useState<{
    checking: boolean;
    isDuplicate: boolean;
    message: string;
  }>({
    checking: false,
    isDuplicate: false,
    message: '',
  });

  // Success message visibility state
  const [showPalletSuccess, setShowPalletSuccess] = useState(false);
  
  // Track if fields are focused
  const [isPalletFocused, setIsPalletFocused] = useState(false);

  // Watch fields for validation
  const palletNo = form.watch('palletNo');

  // Check pallet number uniqueness
  useEffect(() => {
    const checkPalletNumber = async () => {
      // Skip if empty or same as original (in edit mode)
      if (!palletNo || palletNo.trim() === '') {
        setPalletValidation({ checking: false, isDuplicate: false, message: '' });
        return;
      }

      // Skip if same as original pallet number in edit mode
      if (editingInventory && palletNo === editingInventory.pallet_no) {
        setPalletValidation({ checking: false, isDuplicate: false, message: '' });
        return;
      }

      // Debounce: wait 500ms after user stops typing
      const timer = setTimeout(async () => {
        setPalletValidation({ checking: true, isDuplicate: false, message: '' });

        try {
          const response = await authenticatedFetch('/api/dashboard/inventory/check-pallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pallet_numbers: [palletNo.trim()] }),
          });

          if (response.ok) {
            const data = await response.json();
            const exists = data.existing_pallets && data.existing_pallets.includes(palletNo.trim());
            
            setPalletValidation({
              checking: false,
              isDuplicate: exists,
              message: exists ? `Pallet "${palletNo}" ${TOAST_MESSAGES.ERROR.DUPLICATE_PALLET.toLowerCase()}` : '',
            });
          } else {
            setPalletValidation({ checking: false, isDuplicate: false, message: '' });
          }
        } catch (error) {
          console.error('Error checking pallet number:', error);
          setPalletValidation({ checking: false, isDuplicate: false, message: '' });
        }
      }, 500);

      return () => clearTimeout(timer);
    };

    checkPalletNumber();
  }, [palletNo, editingInventory, authenticatedFetch]);

  // Show/hide pallet success message based on focus and validation
  useEffect(() => {
    const isOriginalPallet = editingInventory && palletNo === editingInventory.pallet_no;
    const shouldShow = !!(isPalletFocused && 
                       !palletValidation.checking && 
                       !palletValidation.isDuplicate && 
                       palletNo && 
                       palletNo.trim() !== '' && 
                       !isOriginalPallet);
    setShowPalletSuccess(shouldShow);
  }, [isPalletFocused, palletValidation.checking, palletValidation.isDuplicate, palletNo, editingInventory]);

  // Fetch inventory
  const fetchInventory = useCallback(
    async (page: number, search: string) => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setPaginationLoading(true);
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });

        if (search) {
          params.append('search', search);
        }

        const response = await authenticatedFetch(
          `/api/dashboard/inventory?${params.toString()}`
        );

        if (response.ok) {
          const data = await response.json();
          setInventory(data.inventory || []);
          setStats(data.stats || {
            totalUnits: 0,
            inStorage: 0,
            reserved: 0,
            onTruck: 0,
            onsite: 0,
            returned: 0,
            totalVolume: 0,
            totalWeight: 0,
          });
          setCurrentPage(data.pagination?.currentPage || 1);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalItems(data.pagination?.totalItems || 0);
          setError(null);
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch inventory');
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('An error occurred while fetching inventory');
      } finally {
        setLoading(false);
        setPaginationLoading(false);
      }
    },
    [authenticatedFetch, itemsPerPage]
  );

  // Initial fetch
  useEffect(() => {
    if (hasPermission('inventory.read')) {
      fetchInventory(1, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPermission, authenticatedFetch, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchInventory(page, searchTerm);
    },
    [fetchInventory, searchTerm]
  );

  // Handle search - exactly like clients hook
  const handleSearch = useCallback(async (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
    
    try {
      setPaginationLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: itemsPerPage.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await authenticatedFetch(`/api/dashboard/inventory?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setInventory(data.inventory || []);
        setStats(data.stats || {
          totalUnits: 0,
          inStorage: 0,
          reserved: 0,
          onTruck: 0,
          onsite: 0,
          returned: 0,
          totalVolume: 0,
          totalWeight: 0,
        });
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
        setCurrentPage(data.pagination?.currentPage || 1);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch inventory');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching';
      setError(errorMessage);
    } finally {
      setPaginationLoading(false);
    }
  }, [authenticatedFetch, itemsPerPage]);

  // Handle check-in (create new inventory)
  const handleCheckIn = useCallback(() => {
    setEditingInventory(null);
    form.reset({
      clientId: '',
      label: '',
      description: '',
      lengthMm: undefined,
      widthMm: undefined,
      heightMm: undefined,
      volumeM3: undefined,
      weightKg: undefined,
      stackability: 'stackable',
      topLoadRatingKg: undefined,
      orientationLocked: false,
      fragile: false,
      keepUpright: true,
      priority: null,
      palletNo: '',
      inventoryDate: new Date().toISOString().split('T')[0],
      locationSite: '',
      locationLatitude: null,
      locationLongitude: null,
      locationAisle: '',
      locationBay: '',
      locationLevel: '',
      locationNotes: '',
      quantity: 1,
      status: 'in_storage',
    });
    setIsFormOpen(true);
  }, [form]);

  // Handle edit inventory
  const handleEditInventory = useCallback(
    (inventoryUnit: InventoryUnitType) => {
      setEditingInventory(inventoryUnit);
      form.reset({
        clientId: inventoryUnit.client_id,
        label: inventoryUnit.item?.label || '',
        description: inventoryUnit.item?.description || '',
        lengthMm: inventoryUnit.item?.length_mm || 0,
        widthMm: inventoryUnit.item?.width_mm || 0,
        heightMm: inventoryUnit.item?.height_mm || 0,
        volumeM3: inventoryUnit.item?.volume_m3 || 0,
        weightKg: inventoryUnit.item?.weight_kg || 0,
        stackability: inventoryUnit.item?.stackability || 'stackable',
        topLoadRatingKg: inventoryUnit.item?.top_load_rating_kg || undefined,
        orientationLocked: inventoryUnit.item?.orientation_locked || false,
        fragile: inventoryUnit.item?.fragile || false,
        keepUpright: inventoryUnit.item?.keep_upright !== false,
        priority: inventoryUnit.item?.priority || null,
        palletNo: inventoryUnit.pallet_no || '',
        inventoryDate: inventoryUnit.inventory_date || new Date().toISOString().split('T')[0],
        locationSite: inventoryUnit.location_site || '',
        locationLatitude: inventoryUnit.location_latitude || null,
        locationLongitude: inventoryUnit.location_longitude || null,
        locationAisle: inventoryUnit.location_aisle || '',
        locationBay: inventoryUnit.location_bay || '',
        locationLevel: inventoryUnit.location_level || '',
        locationNotes: inventoryUnit.location_notes || '',
        quantity: inventoryUnit.quantity || 1,
        status: inventoryUnit.status,
      });
      setIsFormOpen(true);
    },
    [form]
  );

  // Handle form submit
  const handleFormSubmit = useCallback(
    async (data: InventoryFormData) => {
      try {
        const apiData = {
          client_id: data.clientId,
          label: data.label,
          description: data.description || null,
          length_mm: data.lengthMm,
          width_mm: data.widthMm,
          height_mm: data.heightMm,
          volume_m3: data.volumeM3,
          weight_kg: data.weightKg,
          stackability: data.stackability,
          top_load_rating_kg: data.topLoadRatingKg || null,
          orientation_locked: data.orientationLocked || false,
          fragile: data.fragile || false,
          keep_upright: data.keepUpright !== undefined ? data.keepUpright : true,
          priority: data.priority || null,
          pallet_no: data.palletNo || null,
          inventory_date: data.inventoryDate || new Date().toISOString().split('T')[0],
          location_site: data.locationSite,
          location_latitude: data.locationLatitude || null,
          location_longitude: data.locationLongitude || null,
          location_aisle: data.locationAisle || null,
          location_bay: data.locationBay || null,
          location_level: data.locationLevel || null,
          location_notes: data.locationNotes || null,
          quantity: data.quantity || 1,
          status: data.status,
        };

        if (editingInventory) {
          // Update existing inventory
          const response = await authenticatedFetch(
            `/api/dashboard/inventory/${editingInventory.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(apiData),
            }
          );

          if (response.ok) {

            showToast.success(TOAST_MESSAGES.SUCCESS.INVENTORY_UPDATED);
            setIsFormOpen(false);
            fetchInventory(currentPage, searchTerm);
          } else {
            const errorData = await response.json();
            showToast.error(errorData.error || TOAST_MESSAGES.ERROR.SERVER_ERROR);
          }
        } else {
          // Create new inventory
          const response = await authenticatedFetch(
            '/api/dashboard/inventory',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(apiData),
            }
          );

          if (response.ok) {
            showToast.success(TOAST_MESSAGES.SUCCESS.INVENTORY_CHECKIN);
            setIsFormOpen(false);
            fetchInventory(1, searchTerm);
          } else {
            const errorData = await response.json();
            showToast.error(errorData.error || TOAST_MESSAGES.ERROR.SERVER_ERROR);
          }
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        showToast.error(TOAST_MESSAGES.ERROR.SERVER_ERROR);
      }
    },
    [editingInventory, authenticatedFetch, fetchInventory, currentPage, searchTerm]
  );

  // Handle form close
  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingInventory(null);
    setPalletValidation({ checking: false, isDuplicate: false, message: '' });
    setShowPalletSuccess(false);
    setIsPalletFocused(false);
    form.reset();
  }, [form]);

  return {
    inventory,
    stats,
    loading,
    paginationLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handlePageChange,
    handleSearch,
    form,
    isFormOpen,
    editingInventory,
    palletValidation,
    showPalletSuccess,
    setIsPalletFocused,
    handleCheckIn,
    handleEditInventory,
    handleFormSubmit,
    handleFormClose,
    hasPermission,
  };
}

