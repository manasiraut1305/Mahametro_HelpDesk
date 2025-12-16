// src/components/DashboardCard.js
import React from 'react';
import '../Styles.css'; // Create this CSS file

function DashboardCard({ title, value, change, iconBg, icon }) {
  // You would typically use react-icons here, or an SVG
  return (
    <div className="dashboard-card">
      <div className="card-icon-wrapper" style={{ backgroundColor: iconBg }}>
        {/* For now, just a letter, you can replace with an actual icon */}
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-content">
        <p className="card-title">{title}</p>
        <h2 className="card-value">{value}</h2>
      </div>
      <div className="card-footer">
        <span className="card-change">{change}</span>
      </div>
    </div>
  );
}

export default DashboardCard;