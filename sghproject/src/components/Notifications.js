import React, { useState, useEffect } from 'react';
import supabase from '../services/supabase';

const Notifications = ({ setNotificationsCount }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: deptData } = await supabase
      .from('departments')
      .select('id')
      .eq('name', 'Cleaning') // Adjust based on user department
      .single();

    const { data, error } = await supabase
      .from('notifications')
      .select('*, reported_issues(*)')
      .eq('department_id', deptData.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data);
    setNotificationsCount(data.filter((n) => !n.is_read).length);
  };

  const markAsRead = async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    fetchNotifications();
  };

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id} style={{ padding: '10px', borderBottom: '1px solid #e0e0e0' }}>
            <p>{notification.message}</p>
            <p>Issue: {notification.reported_issues.issue_type}</p>
            <button onClick={() => markAsRead(notification.id)}>
              {notification.is_read ? 'Read' : 'Mark as Read'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;