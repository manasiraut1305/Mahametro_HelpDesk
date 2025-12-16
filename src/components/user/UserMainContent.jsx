// src/components/MainContent.js
import React, { useContext, useState, useEffect } from "react";
import {
  MdSearch,
  MdPerson,
  MdSettings,
  MdNotifications,
  MdLogout,
} from "react-icons/md";
import "../Styles.css"; // Make sure to create this CSS file
import UserRaisedTicket from "./UserRaisedTicket";
import UserAssignedTicket from "./UserAssignedTicket";
import UserApprovedTicket from "./UserApprovedTicket";
import UserResolvedTicket from "./UserResolvedTicket";
import GenerateTicket from "./GenerateTicket";
import { userListFunction } from "../../api/UserList";
import UserStat from "./UserStat";
import { AuthContext } from "../AuthContext";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/images/mahametro.png";

function UserMainContent({ activeContent }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, logout } = useContext(AuthContext);

  // const getAllData = async () => {
  //   setLoading(true);
  //   setErrorMessage("");
  //   try {
  //     const data = await userListFunction({ id: user?.id });
  //     console.log("data", data);

  //     if (!data?.result || data.result.length === 0) {
  //       setErrorMessage("No ticket data found.");
  //       setTickets([]);
  //     } else {
  //       setTickets(data.result);
  //     }
  //   } catch (err) {
  //     setErrorMessage("API error occurred: " + err.message);
  //     setTickets([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //   useEffect(() => {
  //   getAllData();
  // }, []);

  // useEffect(() => {
  //   console.log("Tiket Data", tickets);

  // },[tickets])

  const [showDefaultPasswordMessage, setShowDefaultPasswordMessage] =
    useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (
      user?.message === "This is default password. You can reset your password."
    ) {
      setShowDefaultPasswordMessage(true);
      setFadeOut(false);

      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 4000);

      const hideTimer = setTimeout(() => {
        setShowDefaultPasswordMessage(false);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [user]);

 

  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const handleProfileClick = () => {
    setShowProfile(true);
  };
  const handleCloseProfile = () => {
    setShowProfile(false);
  };

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

  // Function to show the logout confirmation modal
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <main className="main-content">
      <header className="main-content-header pt-2">
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
        {/* <div>{tickets}</div> */}
        {activeContent === "" && <UserStat />}
        {/* {activeContent === "GenerateTicket" && (
          // console.log("ticket data");
          <GenerateTicket getAllData={tickets} />
        )}
        {activeContent === "UserRaisedTicket" && (
          <UserRaisedTicket AllData={tickets} />
        )}
        {activeContent === "UserAssignedTicket" && (
          <UserAssignedTicket getAllData={tickets} />
        )}
        {activeContent === "UserApprovedTicket" && (
          <UserApprovedTicket getAllData={tickets} />
        )}
        {activeContent === "UserResolvedTicket" && (
          <UserResolvedTicket getAllData={tickets} />
        )} */}
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

export default UserMainContent;
