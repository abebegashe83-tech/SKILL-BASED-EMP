"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Error loading notifications", err);
    }
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      fetchData();
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  return (
    <div className="p-6 transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Notifications</h1>

      {notifications.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
        </div>
      )}

      <div className="grid gap-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-xl border transition-all ${
              n.is_read 
                ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75" 
                : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-sm ring-1 ring-blue-50 dark:ring-blue-900/20"
            }`}
          >
            <div className="flex justify-between items-start">
              <h2 className={`font-semibold ${n.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100 text-lg'}`}>
                {n.title}
              </h2>
              {!n.is_read && (
                 <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
            {!n.is_read && (
              <button
                onClick={() => handleRead(n.id)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-4 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <span>✓</span> Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
