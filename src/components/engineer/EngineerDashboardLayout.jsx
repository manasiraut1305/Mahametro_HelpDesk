// src/components/DashboardLayout.js
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "../Styles.css";
import Sidebar from "./EngineerSidebar";
import MainContent from "./EngineerMainContent";


function EngineerDashboardLayout() {
  
  return (
   <div className="d-flex px-0 vh-100 w-100 bg-gray-100 font-sans m-0 p-0">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="h-16 flex-shrink-0 m-0 p-0">
          <MainContent />
        </header>
        <main className="flex-grow-1 overflow-y-auto m-0 px-3 py-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EngineerDashboardLayout;
