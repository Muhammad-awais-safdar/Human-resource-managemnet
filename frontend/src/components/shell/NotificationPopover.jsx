'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Clock,
  ShieldAlert,
  Info,
  Sparkles,
  UserCheck,
  CheckCircle2,
  Settings,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import apiClient from '@/services/api';

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const popoverRef = useRef(null);

  // Fetch real notifications from Spring Boot API
  const fetchNotifications = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [listRes, countRes] = await Promise.allSettled([
        apiClient.get('/suite/communication/notifications'),
        apiClient.get('/suite/communication/notifications/unread-count'),
      ]);

      let items = [];
      if (listRes.status === 'fulfilled' && Array.isArray(listRes.value)) {
        items = listRes.value;
      }

      const formatted = items.map((item, idx) => {
        const isRead = item.isRead === true || item.is_read === true || item.read === true;
        const category = (item.category || item.type || 'GENERAL').toLowerCase();

        let timeStr = 'Recently';
        const rawDate = item.createdAt || item.created_at;
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch (e) {}
        }

        return {
          id: item.id || `notif-${idx}`,
          title: item.title || 'System Notification',
          message: item.message || '',
          time: timeStr,
          type: category,
          read: isRead,
        };
      });

      setNotifications(formatted);

      if (countRes.status === 'fulfilled' && typeof countRes.value?.count === 'number') {
        setUnreadCount(countRes.value.count);
      } else {
        setUnreadCount(formatted.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to load live notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load & load on open
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
    }
  }, [isOpen, fetchNotifications]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await apiClient.put('/suite/communication/notifications/all/read');
    } catch (e) {
      // Fallback endpoint call
      try {
        await apiClient.put('/suite/smart-notifications/mark-all-read');
      } catch (err) {}
    }
  };

  const handleToggleRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextRead = !n.read;
          setUnreadCount((c) => (nextRead ? Math.max(0, c - 1) : c + 1));
          return { ...n, read: nextRead };
        }
        return n;
      })
    );

    try {
      await apiClient.put(`/suite/communication/notifications/${id}/read`);
    } catch (e) {}
  };

  const filteredNotifications =
    activeTab === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-indigo-500" />;
      case 'leave':
        return <UserCheck className="w-4 h-4 text-amber-500" />;
      case 'success':
      case 'payroll':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'system':
      case 'general':
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
          isOpen
            ? 'bg-blue-50 text-blue-600'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold">
                        {unreadCount} unread
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-500">Live backend database notification queue</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fetchNotifications(true)}
                  className={`p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ${
                    refreshing ? 'animate-spin text-blue-600' : ''
                  }`}
                  title="Refresh Notifications"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="p-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Read All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="px-4 pt-3 flex gap-2 border-b border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'unread'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* NOTIFICATION LIST */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="py-10 text-center text-xs text-slate-400">Loading notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <CheckCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-400">No unread alerts requiring attention.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleToggleRead(notif.id)}
                    className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer group ${
                      notif.read ? 'bg-white hover:bg-slate-50/70' : 'bg-blue-50/30 hover:bg-blue-50/60'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100/80 group-hover:bg-white border border-slate-200/60 shrink-0 mt-0.5 transition-colors">
                      {getTypeIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className={`text-xs tracking-tight truncate ${
                            notif.read ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'
                          }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                href="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Notification Preferences</span>
              </Link>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-blue-600 hover:underline font-bold"
                >
                  Clear Badge
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
