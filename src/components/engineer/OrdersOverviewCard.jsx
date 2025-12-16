// src/components/OrdersOverviewCard.js
import React from 'react';
import { MdNotifications } from 'react-icons/md'; // Example icon for order status
import '../Styles.css'; // Create this CSS file

function OrdersOverviewCard() {
  const orders = [
    { description: '$2400, Design changes', date: '22 DEC 7:20 PM', status: 'new' },
    { description: 'New order #1832412', date: '21 DEC 11 PM', status: 'new' },
    { description: 'Server downtime', date: '21 DEC 9:34 PM', status: 'error' },
    { description: 'New card added for order #3210472', date: '20 DEC 2:20 AM', status: 'card' },
    { description: 'Unlock packages for development', date: '18 DEC 4:54 PM', status: 'unlock' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <div className="status-icon bg-success"><MdNotifications /></div>;
      case 'error': return <div className="status-icon bg-danger"><MdNotifications /></div>; // Example, use different icon
      case 'card': return <div className="status-icon bg-info"><MdNotifications /></div>; // Example, use different icon
      case 'unlock': return <div className="status-icon bg-warning"><MdNotifications /></div>; // Example, use different icon
      default: return <div className="status-icon bg-secondary"><MdNotifications /></div>;
    }
  };

  return (
    <div className="orders-overview-card">
      {/* <div className="card-header">
        <h3>Orders overview</h3>
        <p>+24% this month</p>
      </div>
      <div className="card-body">
        <ul className="order-list">
          {orders.map((order, index) => (
            <li key={index} className="order-item">
              {getStatusIcon(order.status)}
              <div className="order-details">
                <p className="order-description">{order.description}</p>
                <small className="order-date">{order.date}</small>
              </div>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}

export default OrdersOverviewCard;