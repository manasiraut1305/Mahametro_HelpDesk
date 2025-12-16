import React from "react";
import { Outlet } from "react-router-dom";
// import "../Styles.css"; 
import Sidebar from './OperatorSidebar'; 
import OperatorMainContent from "./OperatorMainContent";

function DashboardLayout() {
  return (
    <div className="d-flex vh-100 w-100 bg-gray-100 font-sans m-0 p-0">
      
      {/* Sidebar with fixed width */}
      <div className="flex-shrink-0" style={{ width: "250px" }}>
        <Sidebar />
      </div>

      {/* Main content adjusts automatically */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="h-16 flex-shrink-0 m-0 p-0">
          <OperatorMainContent />
        </header>

        <main className="flex-grow-1 overflow-y-auto m-0 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
