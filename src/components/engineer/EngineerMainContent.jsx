// src/components/MainContent.js
import React, { useContext, useState } from "react";
import {
  MdSearch,
  MdPerson,
  MdSettings,
  MdNotifications,
  MdLogout,
} from "react-icons/md";
import "../Styles.css";
import { AuthContext } from "../AuthContext";
import { Button, Modal } from "react-bootstrap";
import EngineerAssignedTicket from "./EngineerAssignedTicket";
import EngineerApprovedTicket from "./EngineerApprovedTicket";
import EngineerResolvedTicket from "./EngineerResolvedTicket";
import EngineerStat from "./EngineerStat";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/mahametro.png";

function EngineerMainContent({ activeContent }) {
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
   
    setShowLogoutModal(false); // Close the modal after logout
  };

  // Function to show the logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <main className="main-content">
      <header className="main-content-header pt-3">
        <div className="breadcrumb">
          <div className="d-flex flex-row">
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

      <div className="dashboard-grid">
        {activeContent === "" && <EngineerStat />}
        {activeContent === "EngineerAssignedTickets" && (
          <EngineerAssignedTicket />
        )}
        {activeContent === "EngineerApprovedTickets" && (
          <EngineerApprovedTicket />
        )}
        {activeContent === "EngineerResolvedTickets" && (
          <EngineerResolvedTicket />
        )}
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

export default EngineerMainContent;
