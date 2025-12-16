
import React, { useState } from "react";
import "../Styles.css"; 
import Sidebar from "./Sidebar";
import MainContent from "./AdminMainContent";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  const [activeContent, setActiveContent] = useState("");
  return (
    
    <div className="d-flex vh-100 w-100 bg-gray-100 font-sans m-0 p-0">

      <div className="flex-shrink-0" style={{ width: "250px" }}>


      <Sidebar/>
      </div>

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <header className="h-16 flex-shrink-0  m-0 p-0">
          <MainContent 
          />
          </header>

        {/* Content area */}
        <main className="flex-grow-1 overflow-y-auto m-0 p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;