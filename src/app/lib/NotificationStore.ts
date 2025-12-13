'use client';

/**
 * NotificationStore - Manages persistent notification storage
 * Stores notifications in localStorage with read/unread states
 */

export interface StoredNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'permission';
    title: string;
    message: string;
    timestamp: number;
    isRead: boolean;
    dismissedAt?: number;
}

const STORAGE_KEY = 'nour_notifications';
const MAX_STORED_NOTIFICATIONS = 100;

class NotificationStoreManager {
    private listeners: ((notifications: StoredNotification[]) => void)[] = [];

    /**
     * Get all stored notifications
     */
    getAll(): StoredNotification[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];

            const notifications: StoredNotification[] = JSON.parse(stored);
            // Sort by timestamp, newest first
            return notifications.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error reading notifications from storage:', error);
            return [];
        }
    }

    /**
     * Get unread notifications
     */
    getUnread(): StoredNotification[] {
        return this.getAll().filter(n => !n.isRead);
    }

    /**
     * Get unread count
     */
    getUnreadCount(): number {
        return this.getUnread().length;
    }

    /**
     * Add a new notification
     */
    add(notification: Omit<StoredNotification, 'timestamp' | 'isRead'>): void {
        if (typeof window === 'undefined') return;

        try {
            const notifications = this.getAll();
            const newNotification: StoredNotification = {
                ...notification,
                timestamp: Date.now(),
                isRead: false,
            };

            // Add to beginning
            notifications.unshift(newNotification);

            // Keep only last MAX_STORED_NOTIFICATIONS
            const trimmed = notifications.slice(0, MAX_STORED_NOTIFICATIONS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
            this.notifyListeners();
        } catch (error) {
            console.error('Error adding notification to storage:', error);
        }
    }

    /**
     * Mark notification as read
     */
    markAsRead(id: string): void {
        if (typeof window === 'undefined') return;

        try {
            const notifications = this.getAll();
            const updated = notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            );

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            this.notifyListeners();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(): void {
        if (typeof window === 'undefined') return;

        try {
            const notifications = this.getAll();
            const updated = notifications.map(n => ({ ...n, isRead: true }));

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            this.notifyListeners();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    /**
     * Clear all notifications
     */
    clearAll(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem(STORAGE_KEY);
            this.notifyListeners();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    /**
     * Remove a single notification
     */
    remove(id: string): void {
        if (typeof window === 'undefined') return;

        try {
            const notifications = this.getAll();
            const filtered = notifications.filter(n => n.id !== id);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            this.notifyListeners();
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    }

    /**
     * Subscribe to notification changes
     */
    subscribe(listener: (notifications: StoredNotification[]) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners of changes
     */
    private notifyListeners(): void {
        const notifications = this.getAll();
        this.listeners.forEach(listener => listener(notifications));
    }
}

// Export singleton instance
export const notificationStore = new NotificationStoreManager();
