
import React, { useState } from "react";
import "../Styles.css"; 

import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";
import UserMainContent from "./UserMainContent";

function DashboardLayout() {
  return (
     <div className="d-flex vh-100 w-100 bg-gray-100 font-sans m-0 p-0">
      <UserSidebar />
       <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="h-16 flex-shrink-0 m-0 p-0">
          <UserMainContent />
         </header>

        {/* Content area */}
        <main className="flex-grow-1 overflow-y-auto m-0 px-3 py-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;