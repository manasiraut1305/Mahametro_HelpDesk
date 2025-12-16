// src/components/MainContent.js
import React, { useContext, useState } from "react";
import {
  MdSearch,
  MdPerson,
  MdSettings,
  MdNotifications,
  MdLogout,
} from "react-icons/md";
import { Routes, Route } from "react-router-dom";
import "../Styles.css"; // Make sure to create this CSS file
import AdminRaisedTicket from "./AdminRaisedTickets";
import AdminCreateUser from "./AdminCreateUser";
import AdminEditUser from "./AdminEditUser";
import AdminAssignedTicket from "./AdminAssignedTickets";
import AdminApprovedTicket from "./AdminApprovedTickets";
import AdminResolvedTickets from "./AdminResolvedTickets";
import AdminStart from "./AdminStart";
import CategoryList from "./CategoryList";
import ProjectCard from "./ProjectCard";
import { AuthContext } from "../AuthContext";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminUserStatus from "./AdminUserStatus";

import logo from "../../assets/images/mahametro.png";

function MainContent({ activeContent }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const handleProfileClick = () => {
    setShowProfile(true);
  };
  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, ` =;expires=${new Date(0).toUTCString()};path=/`);
    });
    navigate("/");
    
    setShowLogoutModal(false); 
  };

 
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <main className="main-content">
      <header className="main-content-header">
        <div className="breadcrumb">
          <div className="d-flex flex-row ">
            <img
              src={logo}
              alt="Logo"
              style={{ height: "55px", paddingRight: "20px" }}
            />
            <h3>Maha Metro Rail Project </h3>
          </div>
        </div>
        <div className="header-right">
          <div className="header-icons">
            {/* Click handler for profile icon */}
            <MdPerson
              className="header-icon"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            />
            {/* Click handler for logout icon to show confirmation modal */}
            <MdLogout
              className="header-icon"
              onClick={handleLogoutClick}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </header>

      {/* <div className="dashboard-grid">
        {activeContent === "1" && <DashboardStart />}
        {activeContent === "AdminCreateUser" && <AdminCreateUser />}
        {activeContent === "AdminEditUser" && <AdminEditUser />}
        {activeContent === "AdminRaisedTickets" && <AdminRaisedTicket />}
        {activeContent === "AdminAssignedTickets" && <AdminAssignedTicket />}
        {activeContent === "AdminApprovedTickets" && <AdminApprovedTicket />}
        {activeContent === "AdminResolvedTickets" && <AdminResolvedTickets />}
        {activeContent === "CategoryList" && <CategoryList />}
      </div> */}

      <div className="dashboard-grid">
        <Routes>
          {/* Default route for the dashboard stats */}
          <Route path="/" element={<AdminStart />} />
          {/* <Route path="/userCreate" element={<AdminCreateUser />} />
          <Route path="/editCreate" element={<AdminEditUser />} />  */}
          {/* <Route path="/categoryList" element={<CategoryList />} />  */}
          {/* <Route path="/raised-tickets" element={<AdminRaisedTicket />} />
          <Route path="/assigned-tickets" element={<AdminAssignedTicket />} />
          <Route path="/approved-tickets" element={<AdminApprovedTicket />} />
          <Route path="/resolved-tickets" element={<AdminResolvedTickets />} /> */}
          {/* <Route path="/adminUserStatus" element={<AdminUserStatus />} /> */}
          {/* <Route path="/report" element={<ProjectCard />} /> */}
        </Routes>
      </div>

      {/* Profile Modal */}
      <Modal show={showProfile} onHide={handleCloseProfile} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{ color: "white" }}>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="fw-semibold text-black">
            <div className="d-row mt-2">
              <label>Name: {user?.name}</label>
              <br />
              <label>Email: {user?.email}</label>
              <br />
              <span>Mobile: {user?.mobile}</span>
              <br />
              <span>Designation: {user?.designation}</span>
              <br />
              <span>Department: {user?.department}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          {/* You can add buttons here, e.g., an edit button */}
        </Modal.Footer>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        dialogClassName="custom-modal" // Apply custom styling if defined in Styles.css
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{ color: "white" }}>
            🔒 Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="text-dark"
          style={{ fontSize: "1rem", padding: "20px" }}
        >
          <p>Are you sure you want to log out?</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            onClick={handleLogout}
            style={{
              backgroundColor: "#4682B4",
              borderColor: "#4682B4",
              color: "white",
              fontWeight: "500",
            }}
            className="px-4"
          >
            Yes, Logout
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowLogoutModal(false)}
            className="px-4"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

export default MainContent;
