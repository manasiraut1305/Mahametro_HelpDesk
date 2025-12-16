// src/components/MainContent.js
import React, { useContext, useState } from "react";
import {
  MdSearch,
  MdPerson,
  MdSettings,
  MdNotifications,
  MdLogout,
} from "react-icons/md";
import "../Styles.css"; // Make sure to create this CSS file
import OperatorRaisedTicket from "./OperatorRaisedTicket";
import OperatorAssignedTicket from "./OperatorAssignedTicket";
import OperatorApprovedTicket from "./OperatorApprovedTickets";
import OperatorResolvedTicket from "./OperatorResolvedTicket";
import ProjectCard from "./ProjectCard";
import OperatorStat from "./OperatorStat";
import { AuthContext } from "../AuthContext";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OperatorAddTicket from "./OperatorAddTicket";

function OperatorMainContent({ activeContent }) {
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
        .replace(/=.*/,` =;expires=${new Date(0).toUTCString()};path=/`);
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
      <header className="main-content-header">
        <div className="breadcrumb">
          <span>Dashboard</span>
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
        {activeContent === "" && <OperatorStat />}
        {activeContent === "OperatorAddTicket" && <OperatorAddTicket />}
        {activeContent === "OperatorRaisedTicket" && <OperatorRaisedTicket />}
        {activeContent === "OperatorAssignedTicket" && <OperatorAssignedTicket />}
        {activeContent === "OperatorApprovedTicket" && <OperatorApprovedTicket />}
        {activeContent === "OperatorResolvedTicket" && <OperatorResolvedTicket />}
        {activeContent === "ProjectCard" && <ProjectCard />}
        
      </div>

       {/* Profile Modal */}
      <Modal show={showProfile} onHide={handleCloseProfile} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{color:"white"}}>User Profile</Modal.Title>
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

        </Modal.Footer>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        dialogClassName="custom-modal" 
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title style={{color:"white"}}>🔒 Confirm Logout</Modal.Title>
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

export default OperatorMainContent;