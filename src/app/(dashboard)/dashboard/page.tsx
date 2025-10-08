'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, signOut, isPM, isWarehouse, isClientViewer } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.full_name || user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Role: {user?.role}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Assigned Clients</h3>
              <p className="text-blue-700 mt-2">
                {user?.clients.length || 0} client(s) assigned
              </p>
              {user?.clients.map((client) => (
                <div key={client.id} className="mt-2 text-sm text-blue-600">
                  • {client.name}
                </div>
              ))}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Permissions</h3>
              <div className="text-green-700 mt-2 text-sm">
                {isPM && <div>• Project Management</div>}
                {isWarehouse && <div>• Inventory Management</div>}
                {isClientViewer && <div>• View Only Access</div>}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-900">Status</h3>
              <p className="text-yellow-700 mt-2">
                {user?.status === 'active' ? '✅ Active' : '❌ Inactive'}
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Phase 1 Complete!</h3>
            <p className="text-gray-600">
              This is a simplified Phase 1 implementation with essential admin dashboard functionality.
              Future phases will include inventory management, truck loading algorithms, and more features.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}