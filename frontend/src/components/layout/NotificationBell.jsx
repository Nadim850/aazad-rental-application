import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/Button';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return;
      const res = await apiFetch('http://localhost:8000/api/accounts/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id, actionUrl) => {
    try {
      const token = localStorage.getItem('access');
      await apiFetch(`http://localhost:8000/api/accounts/notifications/${id}/read/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access');
      await apiFetch('http://localhost:8000/api/accounts/notifications/read-all/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('access');
      await apiFetch(`http://localhost:8000/api/accounts/notifications/${id}/delete/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-border-main/50 transition-colors text-text-main/70 hover:text-text-main focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border-main rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-border-main flex items-center justify-between bg-surface/50">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline flex items-center"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Mark all as read
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-main/50">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border-main/50">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id, notification.action_url)}
                    className={`p-4 cursor-pointer hover:bg-primary/5 transition-colors group relative ${!notification.is_read ? 'bg-primary/10' : ''}`}
                  >
                    <div className="flex gap-3">
                      {!notification.is_read && (
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <h4 className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium text-text-main/80'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-text-main/60 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-text-main/40 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => deleteNotification(e, notification.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-text-main/40 hover:text-error hover:bg-error/10 rounded-md transition-all h-fit"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
