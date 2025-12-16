'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Truck, Package, Users, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export type NotificationType = 'defect' | 'defect_resolved' | 'inspection' | 'asset' | 'team';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  company_id: string;
  user_id?: string;
  read: boolean;
  created_at: Timestamp | string;
  link?: string;
  metadata?: Record<string, any>;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'defect':
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
    case 'defect_resolved':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'inspection':
      return <Truck className="h-5 w-5 text-blue-400" />;
    case 'asset':
      return <Package className="h-5 w-5 text-purple-400" />;
    case 'team':
      return <Users className="h-5 w-5 text-yellow-400" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-white/50" />;
  }
};

const formatNotificationDate = (date: Timestamp | string): string => {
  try {
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'MMM dd, yyyy HH:mm');
    }
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Unknown date';
  }
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${
        !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-white/70'}`}>
                {notification.title}
              </p>
              <p className="text-xs text-white/60 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-white/40 mt-2">
                {formatNotificationDate(notification.created_at)}
              </p>
            </div>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="flex-shrink-0 p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="Delete notification"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
