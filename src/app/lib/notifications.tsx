'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Shield,
  Lock,
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'permission';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Auto-dismiss duration in ms (null for sticky)
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showPermissionError: (
    title: string, 
    message: string, 
    requiredRoles?: string,
    userRole?: string
  ) => void;
  dismissNotification: (id: string) => void;
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// ============================================================================
// UNIQUE ID GENERATOR
// ============================================================================

let notificationCounter = 0;

const generateUniqueId = (): string => {
  notificationCounter += 1;
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${notificationCounter}`;
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  private static listeners: ((notification: Notification) => void)[] = [];

  static subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
  }

  static unsubscribe(listener: (notification: Notification) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private static emit(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
  }

  static show(notification: Omit<Notification, 'id'>) {
    const id = generateUniqueId();
    const fullNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    };
    
    this.emit(fullNotification);
  }

  static success(title: string, message: string, duration?: number) {
    this.show({
      type: 'success',
      title,
      message,
      duration,
      icon: <CheckCircle className="w-5 h-5" />,
    });
  }

  static error(title: string, message: string, duration?: number) {
    this.show({
      type: 'error',
      title,
      message,
      duration,
      icon: <AlertCircle className="w-5 h-5" />,
    });
  }

  static warning(title: string, message: string, duration?: number) {
    this.show({
      type: 'warning',
      title,
      message,
      duration,
      icon: <AlertTriangle className="w-5 h-5" />,
    });
  }

  static info(title: string, message: string, duration?: number) {
    this.show({
      type: 'info',
      title,
      message,
      duration,
      icon: <Info className="w-5 h-5" />,
    });
  }

  static permissionError(
    title: string, 
    message: string, 
    requiredRoles?: string,
    userRole?: string
  ) {
    this.show({
      type: 'permission',
      title,
      message,
      duration: 8000, // Longer for permission errors
      icon: <Lock className="w-5 h-5" />,
    });

    // Also dispatch the permission modal event for the GlobalPermissionModal
    if (requiredRoles && userRole) {
      const event = new CustomEvent('show-permission-error', {
        detail: {
          title,
          message,
          requiredRoles,
          userRole,
        },
      });
      window.dispatchEvent(event);
    }
  }
}

// ============================================================================
// NOTIFICATION PROVIDER
// ============================================================================

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = generateUniqueId();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-dismiss if duration is set
    if (newNotification.duration) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  // Subscribe to the static service
  useEffect(() => {
    const handleServiceNotification = (notification: Notification) => {
      showNotification(notification);
    };

    NotificationService.subscribe(handleServiceNotification);
    return () => NotificationService.unsubscribe(handleServiceNotification);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    showSuccess: (title, message, duration) =>
      showNotification({
        type: 'success',
        title,
        message,
        duration,
        icon: <CheckCircle className="w-5 h-5" />,
      }),
    showError: (title, message, duration) =>
      showNotification({
        type: 'error',
        title,
        message,
        duration,
        icon: <AlertCircle className="w-5 h-5" />,
      }),
    showWarning: (title, message, duration) =>
      showNotification({
        type: 'warning',
        title,
        message,
        duration,
        icon: <AlertTriangle className="w-5 h-5" />,
      }),
    showInfo: (title, message, duration) =>
      showNotification({
        type: 'info',
        title,
        message,
        duration,
        icon: <Info className="w-5 h-5" />,
      }),
    showPermissionError: (title, message, requiredRoles, userRole) => {
      showNotification({
        type: 'permission',
        title,
        message,
        duration: 8000,
        icon: <Lock className="w-5 h-5" />,
      });

      // Also dispatch modal event
      if (requiredRoles && userRole) {
        const event = new CustomEvent('show-permission-error', {
          detail: {
            title,
            message,
            requiredRoles,
            userRole,
          },
        });
        window.dispatchEvent(event);
      }
    },
    dismissNotification,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// ============================================================================
// NOTIFICATION CONTAINER
// ============================================================================

function NotificationContainer() {
  const { notifications, dismissNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 w-full max-w-sm">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// NOTIFICATION TOAST COMPONENT
// ============================================================================

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    permission: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  const iconClasses = {
    success: 'text-green-500 bg-green-100',
    error: 'text-red-500 bg-red-100',
    warning: 'text-amber-500 bg-amber-100',
    info: 'text-blue-500 bg-blue-100',
    permission: 'text-purple-500 bg-purple-100',
  };

  return (
    <div
      className={`${typeClasses[notification.type]} border rounded-xl shadow-lg p-4 animate-slide-in-right`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`${iconClasses[notification.type]} p-2 rounded-lg flex-shrink-0`}
        >
          {notification.icon || (
            <>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
              {notification.type === 'permission' && <Lock className="w-5 h-5" />}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
          <p className="text-sm opacity-90">{notification.message}</p>
          
          {/* Action Button */}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-xs font-semibold hover:underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK AND EXPORTS
// ============================================================================

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Export the static service
export const notificationService = NotificationService;

// Add this CSS to your global styles
const styles = `
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;