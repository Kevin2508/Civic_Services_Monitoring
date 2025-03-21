import React from 'react';

const Header = ({ user, department }) => {
  return (
    <header className="header">
      <div className="logo-title">
        <img src="/logo.png" alt="SMC Logo" className="logo" />
        <h1>Surat Municipal Corporation</h1>
      </div>
      <div className="user-info">
        {department && <span>{department}</span>}
        <span>{user.username} ({user.role})</span>
        <i className="fas fa-chevron-down"></i>
      </div>
    </header>
  );
};

export default Header;