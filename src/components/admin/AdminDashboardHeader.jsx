// src/components/DashboardHeader.js
import React from 'react';
import { MdSearch, MdPerson, MdSettings, MdNotifications } from 'react-icons/md';
import '../Styles.css';

function DashboardHeader() {
  return (
    <header className="dashboard-header">
      <div className="breadcrumb">
        <span>/ Dashboard</span>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <MdSearch />
          <input type="text" placeholder="Search here" />
        </div>
        <div className="header-icons">
          <MdPerson />
          <MdSettings />
          <MdNotifications />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;