import { Package, Archive, Truck, MapPin, RotateCcw, Ruler, Weight } from 'lucide-react';
import type { InventoryStatsType } from './types';

interface InventoryStatsCardsProps {
  stats: InventoryStatsType;
}

export default function InventoryStatsCards({ stats }: InventoryStatsCardsProps) {
  const cards = [
    {
      title: 'Total Units',
      value: stats.totalUnits,
      icon: Package,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'In Storage',
      value: stats.inStorage,
      icon: Archive,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Reserved',
      value: stats.reserved,
      icon: MapPin,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'On Truck',
      value: stats.onTruck,
      icon: Truck,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Onsite',
      value: stats.onsite,
      icon: MapPin,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Returned',
      value: stats.returned,
      icon: RotateCcw,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    {
      title: 'Total Volume',
      value: `${stats.totalVolume.toFixed(2)} m³`,
      icon: Ruler,
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Total Weight',
      value: `${stats.totalWeight.toFixed(2)} kg`,
      icon: Weight,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

