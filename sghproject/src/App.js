import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import IssueHistory from './components/IssueHistory';
import Analysis from './components/Analysis';
import Notifications from './components/Notifications';
import ProtectedRoute from './pages/ProtectedRoute';
import './App.css';

const Layout = ({ user, notificationsCount, children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  console.log('Rendering Layout', { user, isLoginPage, notificationsCount });

  return (
    <div className="app">
      {!isLoginPage && user ? (
        <>
          <Header user={user} department={user?.role === 'Department' ? user.department : null} />
          <Sidebar notificationsCount={notificationsCount} />
        </>
      ) : null}
      <main className={isLoginPage ? 'full-screen' : 'main-content'}>
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [notificationsCount, setNotificationsCount] = useState(0);

  console.log('Rendering App', { user, notificationsCount });

  if (!user && localStorage.getItem('token')) {
    console.log('Restoring user from localStorage');
    setUser({
      username: 'user',
      role: localStorage.getItem('role') || 'Admin',
      department: localStorage.getItem('department') || null,
    });
  }

  return (
    <Router>
      <ToastContainer />
      <Layout user={user} notificationsCount={notificationsCount}>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user ? (
                  user.role === 'Admin' ? (
                    <AdminDashboard />
                  ) : (
                    <DepartmentDashboard department={user.department || 'Cleaning'} />
                  )
                ) : (
                  <div>Loading user...</div>
                )}
              </ProtectedRoute>
            }
          />
          <Route path="/insights" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
          <Route path="/past-records" element={<ProtectedRoute><IssueHistory /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications setNotificationsCount={setNotificationsCount} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><div>Profile Page</div></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><div>About Developers</div></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;