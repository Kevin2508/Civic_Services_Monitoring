import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ notificationsCount }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <ul>
        <li>
          <NavLink to="/dashboard">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/insights">
            <i className="fas fa-chart-bar"></i>
            <span>Insights</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/past-records">
            <i className="fas fa-file-alt"></i>
            <span>Past Records</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/notifications">
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
            {notificationsCount > 0 && <span className="badge">{notificationsCount}</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile">
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/about">
            <i className="fas fa-info-circle"></i>
            <span>About Developers</span>
          </NavLink>
        </li>
        <li>
          <button onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;