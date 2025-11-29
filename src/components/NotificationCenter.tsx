import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead } from '../services/api';
import './NotificationCenter.css';

interface Notification {
    notification_id: number;
    user_id: string;
    type: string;
    title: string;
    message: string;
    related_id: number;
    related_type: string;
    read_status: boolean;
    created_at: string;
}

interface NotificationCenterProps {
    userId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const data = await getNotifications(userId);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const data = await getUnreadNotificationsCount(userId);
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Initial load
    useEffect(() => {
        if (userId) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [userId]);

    // Polling every 30 seconds
    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
            if (isOpen) {
                fetchNotifications();
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [userId, isOpen]);

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

    const toggleDropdown = async () => {
        if (!isOpen) {
            setLoading(true);
            await fetchNotifications();
            setLoading(false);
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.read_status) {
            try {
                await markNotificationAsRead(notification.notification_id);
                setNotifications(notifications.map(n =>
                    n.notification_id === notification.notification_id
                        ? { ...n, read_status: true }
                        : n
                ));
                setUnreadCount(Math.max(0, unreadCount - 1));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to related content (you can customize this based on your routing)
        // For now, just close the dropdown
        setIsOpen(false);
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Hace un momento';
        if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
        if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'job_cancelled':
                return '🚫';
            case 'quote_cancelled':
                return '❌';
            case 'quote_received':
                return '📋';
            default:
                return '🔔';
        }
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button className="notification-bell" onClick={toggleDropdown}>
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notificaciones</h3>
                        {unreadCount > 0 && (
                            <span className="unread-count">{unreadCount} nuevas</span>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">
                                <span className="spinner"></span> Cargando...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span className="empty-icon">📭</span>
                                <p>No tienes notificaciones</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.notification_id}
                                    className={`notification-item ${!notification.read_status ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">{getTimeAgo(notification.created_at)}</div>
                                    </div>
                                    {!notification.read_status && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
