'use client';

import React from 'react';
import { FolderKanban, Building2, Play, Pause } from 'lucide-react';

interface ProjectsStatsCardsProps {
  stats: {
    totalProjects: number;
    totalClients: number;
    activeProjects: number;
    onHoldProjects: number;
  };
}

export default function ProjectsStatsCards({ stats }: ProjectsStatsCardsProps) {
  const cards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Building2,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Play,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'On Hold Projects',
      value: stats.onHoldProjects,
      icon: Pause,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

