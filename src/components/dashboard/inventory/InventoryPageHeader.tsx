import { Plus, Package } from 'lucide-react';

interface InventoryPageHeaderProps {
  hasPermission: (permission: string) => boolean;
  onCheckIn: () => void;
}

export default function InventoryPageHeader({
  hasPermission,
  onCheckIn,
}: InventoryPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">
            Manage warehouse inventory and track pallet locations
          </p>
        </div>
      </div>
      {hasPermission('inventory.create') && (
        <button
          onClick={onCheckIn}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Check-In Pallet
        </button>
      )}
    </div>
  );
}

