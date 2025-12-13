'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, PackageOpen } from 'lucide-react';
import { notificationStore, StoredNotification } from '../../lib/NotificationStore';
import {
    CheckCircle,
    AlertCircle,
    AlertTriangle,
    Info,
    Lock,
} from 'lucide-react';

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<StoredNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load notifications and subscribe to changes
    useEffect(() => {
        const updateNotifications = () => {
            setNotifications(notificationStore.getAll());
            setUnreadCount(notificationStore.getUnreadCount());
        };

        // Initial load
        updateNotifications();

        // Subscribe to changes
        const unsubscribe = notificationStore.subscribe(updateNotifications);

        return unsubscribe;
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleNotificationClick = (notification: StoredNotification) => {
        if (!notification.isRead) {
            notificationStore.markAsRead(notification.id);
        }
    };

    const handleMarkAllAsRead = () => {
        notificationStore.markAllAsRead();
    };

    const handleClearAll = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
            notificationStore.clearAll();
            setIsOpen(false);
        }
    };

    const getNotificationIcon = (type: StoredNotification['type']) => {
        const iconClasses = "w-5 h-5";
        switch (type) {
            case 'success':
                return <CheckCircle className={`${iconClasses} text-green-500`} />;
            case 'error':
                return <AlertCircle className={`${iconClasses} text-red-500`} />;
            case 'warning':
                return <AlertTriangle className={`${iconClasses} text-amber-500`} />;
            case 'info':
                return <Info className={`${iconClasses} text-blue-500`} />;
            case 'permission':
                return <Lock className={`${iconClasses} text-purple-500`} />;
            default:
                return <Info className={`${iconClasses} text-gray-500`} />;
        }
    };

    const getRelativeTime = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;

        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group"
                aria-label="Notifications"
            >
                <Bell className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'scale-110' : 'group-hover:scale-110'}`} />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] px-1.5 flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <div
                        className="fixed inset-0 bg-black/20 z-[998] lg:hidden"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-3 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 z-[999] animate-scale-in overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-stone-50 to-amber-50 border-b border-stone-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-stone-700" />
                                    <h3 className="font-bold text-stone-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                                            title="Marquer tout comme lu"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}

                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearAll}
                                            className="p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
                                            title="Tout supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[500px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                // Empty State
                                <div className="py-12 px-6 text-center">
                                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <PackageOpen className="w-8 h-8 text-stone-400" />
                                    </div>
                                    <h4 className="font-semibold text-stone-900 mb-1">Aucune notification</h4>
                                    <p className="text-sm text-stone-500">Vous êtes à jour !</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`px-5 py-4 cursor-pointer transition-all duration-200 hover:bg-stone-50 group ${!notification.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-1">
                                                        <h4 className={`text-sm font-semibold leading-snug ${!notification.isRead ? 'text-stone-900' : 'text-stone-700'
                                                            }`}>
                                                            {notification.title}
                                                        </h4>

                                                        {!notification.isRead && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-stone-600 mb-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>

                                                    <p className="text-xs text-stone-400 font-medium">
                                                        {getRelativeTime(notification.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && unreadCount > 0 && (
                            <div className="px-5 py-3 border-t border-stone-200 bg-stone-50/50">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="w-full text-sm text-amber-600 hover:text-amber-700 font-semibold py-2 hover:bg-amber-50 rounded-lg transition-colors duration-200"
                                >
                                    Marquer tout comme lu ({unreadCount})
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
