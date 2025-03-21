import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please enter a username and password');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, departments(name)')
        .eq('username', username)
        .eq('password', password) // In a real app, hash the password
        .single();

      if (error || !data) {
        setError('Invalid username or password');
        return;
      }

      const user = {
        username: data.username,
        role: data.role,
        department: data.role === 'Admin' ? null : data.departments?.name,
      };

      localStorage.setItem('token', 'mock-token'); // Replace with a real token in a production app
      localStorage.setItem('role', user.role);
      localStorage.setItem('department', user.department || '');
      setUser(user);
      console.log('User logged in:', user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="login-branding">
        <img src="/logo.png" alt="SMC Logo" className="login-logo" />
        <h1>SURAT MUNICIPAL CORPORATION</h1>
      </div>
      <div className="login-container">
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;