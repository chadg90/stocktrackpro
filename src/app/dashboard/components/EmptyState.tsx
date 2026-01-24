'use client';

import React from 'react';
import { 
  Package, 
  Truck, 
  Users, 
  AlertTriangle, 
  History, 
  MapPin, 
  Key, 
  FileText,
  Search,
  Plus,
  BarChart3,
  LucideIcon
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type EmptyStateType = 
  | 'assets' 
  | 'vehicles' 
  | 'team' 
  | 'defects' 
  | 'history' 
  | 'locations' 
  | 'access-codes'
  | 'notifications'
  | 'search'
  | 'analytics'
  | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  showAction?: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

const emptyStateConfig: Record<EmptyStateType, {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}> = {
  assets: {
    icon: Package,
    title: 'No assets found',
    description: 'Start by adding your first asset to track equipment and tools.',
    actionLabel: 'Add Asset',
  },
  vehicles: {
    icon: Truck,
    title: 'No vehicles found',
    description: 'Add vehicles to your fleet to start tracking inspections and maintenance.',
    actionLabel: 'Add Vehicle',
  },
  team: {
    icon: Users,
    title: 'No team members found',
    description: 'Invite team members to collaborate on asset and fleet management.',
    actionLabel: 'Invite Member',
  },
  defects: {
    icon: AlertTriangle,
    title: 'No defects reported',
    description: 'Great news! There are no outstanding defects requiring attention.',
  },
  history: {
    icon: History,
    title: 'No activity history',
    description: 'Activity will appear here as your team uses assets and vehicles.',
  },
  locations: {
    icon: MapPin,
    title: 'No locations added',
    description: 'Add locations to organize where your assets and vehicles are stored.',
    actionLabel: 'Add Location',
  },
  'access-codes': {
    icon: Key,
    title: 'No access codes',
    description: 'Generate access codes to invite new team members to your organization.',
    actionLabel: 'Generate Code',
  },
  notifications: {
    icon: FileText,
    title: 'No notifications',
    description: 'You\'re all caught up! Notifications will appear here when there\'s activity.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
  },
  analytics: {
    icon: BarChart3,
    title: 'No data available',
    description: 'Analytics will populate as your team starts using the system.',
  },
  generic: {
    icon: FileText,
    title: 'Nothing here yet',
    description: 'Get started by adding some data.',
  },
};

// ============================================
// COMPONENT
// ============================================

export default function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  icon: CustomIcon,
  showAction = true,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon with gradient background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-10 w-10 text-primary/60" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2 text-center">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-white/60 text-sm text-center max-w-sm mb-6">
        {displayDescription}
      </p>

      {/* Action Button */}
      {showAction && displayActionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {displayActionLabel}
        </button>
      )}
    </div>
  );
}

// ============================================
// COMPACT VARIANT
// ============================================

interface EmptyStateCompactProps {
  message?: string;
  icon?: LucideIcon;
}

export function EmptyStateCompact({ 
  message = 'No data available', 
  icon: Icon = FileText 
}: EmptyStateCompactProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <Icon className="h-8 w-8 text-white/20 mb-2" />
      <p className="text-white/50 text-sm">{message}</p>
    </div>
  );
}

// ============================================
// TABLE ROW VARIANT
// ============================================

interface EmptyStateTableRowProps {
  colSpan: number;
  message?: string;
}

export function EmptyStateTableRow({ 
  colSpan, 
  message = 'No data found' 
}: EmptyStateTableRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center">
          <Search className="h-8 w-8 text-white/20 mb-2" />
          <p className="text-white/50 text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
}
